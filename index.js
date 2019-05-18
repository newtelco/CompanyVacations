const dotenv = require('dotenv')
const env = dotenv.config({ path: './config.env' })
const express = require('express')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const bodyParser = require('body-parser')
const passport = require('passport')
const ldapstrategy = require('passport-ldapauth')
const mysql = require('mysql')
const moment = require('moment')
const { DateTime } = require('luxon')
const uuid = require('uuid/v4')
let {google} = require('googleapis')
const google_key = require(process.env.GS_APIKEY)


function addCal(summary, desc, start, end, user, calendarId) {
  (() => {
  "use strict";
  // const google_key = require("./nt_gsuite_priv.json"); 

  var event = {
    'summary': summary,
    'description': desc,
    'start': {
      'date': start,
      'timeZone': 'Europe/Berlin'
    },
    'end': {
      'date': end,
      'timeZone': 'Europe/Berlin'
    },
    'attendees': [
      {'email': user}
    ],
    'reminders': {
      'useDefault': true
    }
  };

  const jwtClient = new google.auth.JWT(
    google_key.client_email,
    null,
    google_key.private_key,
    ["https://mail.google.com/", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"], 
    process.env.GS_USER
  );

  jwtClient.authorize((err, tokens) => (err
    ? console.log(err)
    : (() => { 
      console.log("Google-API Authed!");

      let calendar = google.calendar('v3');
      calendar.events.insert({
        auth: jwtClient,
        calendarId: calendarId,
        resource: event
      }, function (err, response) {
        console.log(err)
        // console.log(response)
      });
    })() 
  ))
})();
}

function sendMsg(userName, userMail, subject, body) {
  (() => {
  "use strict";

  subject = `[VACATION] ${subject}`
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `From: Newtelco Vacations <device@newtelco.de>`,
    `To: ${userName}  <${userMail}>`,
    // `Cc: ["${ccMail}"]`, 
    `Content-Type: text/html; charset=utf-8`,
    `MIME-Version: 1.0`,
    `Subject: ${utf8Subject}`,
    '',
    body,
    ''
  ];
  const message = messageParts.join('\n');

  // The body needs to be base64url encoded.
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const jwtClient = new google.auth.JWT(
    google_key.client_email,
    null,
    google_key.private_key,
    ["https://mail.google.com/", "https://www.googleapis.com/auth/calendar"], 
    process.env.GS_USER
  );

  jwtClient.authorize((err, tokens) => (err
    ? console.log(err)
    : (() => { //--------------------------------
      console.log("Google-API Authed!");
      const gmail = google.gmail({
        version: "v1",
        auth: jwtClient
      });
      gmail.users.messages.send({
        userId: process.env.GS_USER,
        resource: {
          raw: encodedMessage
        }
      }, (err, messages) => {
        //will print out an array of messages plus the next page token
        console.log(err);
        // console.dir(messages);
      });
    })() 
  ));
})();
}

function memberOfAdmin(group) {
  for(i = 0; i < group.length; i++) {
      if(group[i].includes('AdminGroup') || group[i].includes('Administratoren') || group[i].includes('Management')) {
        return true
      } 
  }
  return false
}

var connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PW,
  database : process.env.DB_DB,
  port     : process.env.DB_PORT
})

connection.connect((err) => {
    if (err) throw err
    console.log('You are now connected...')
})

const ldapUrl = `ldap://${process.env.LDAP_URL}`
var OPTS = {
    server: {
        url             : ldapUrl,
        bindDN          : process.env.LDAP_BINDDN,
        bindCredentials : process.env.LDAP_BINDPW,
        searchBase      : process.env.LDAP_SEARCHBASE,
        searchFilter    : process.env.LDAP_SEARCHFILTER
    }
}

const app = express()
passport.use(new ldapstrategy(OPTS))

app.use(session({
    secret: '87oY7tsTHbYuU6oeS36RudzZjrXopf0ltNUeQInlDbTPSeRSWglLcEWVDPy43twKmjOl8rRlE8cvFSpWEhaIS0e5mPli17bhyve2vVRBld6ZRpyw94tM5ms7YY932W1u',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
    store: new FileStore()
}))

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get('/', (req, res) => {
  if(req.isAuthenticated()) {
    res.redirect('/dashboard.html')
  }
})

app.get('/login', (req, res) => {
    res.status(403).redirect('/?failed=1')
})

app.post('/login', (req, res, next) => {
  passport.authenticate('ldapauth', {session: false}, (err, user, info) => {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (! user) {
      console.log('\nRequest Login failed!')
      return res.status(403).redirect('/?failed=1')
    }
    req.login(user,(err) => {
        if (err) return next(err)
        var loginTime = moment().local().format('DD.MM.YYYY HH:mm:ss')
        console.log(`[LOGIN] ${req.user.sAMAccountName} - ${loginTime}`)
        let returnToUrl = ''
        if(req.session.returnTo != ''){
          returnToUrl = req.session.returnTo
          delete req.session.returnTo
        }
        return res.redirect(returnToUrl || 'dashboard')
    })
  })(req, res, next);
});

app.get('/logout', (req, res) => {
  //req.session.destroy()
  req.logout()
  return res.redirect('/')
})

app.get('/dashboard', (req, res) => {
  if(req.isAuthenticated()) {
    res.sendFile(__dirname + '/public/dashboard.html')
  } else {
    req.session.returnTo = req.originalUrl
    return res.status(403).redirect('/')
  }
})

app.get('/request', (req, res) => {
  if(req.isAuthenticated()) {
    res.sendFile(__dirname + '/public/request.html')
  } else {
    req.session.returnTo = req.originalUrl
    return res.status(403).redirect('/')
  }
})


app.get('/overview', (req, res) => {
  if(req.isAuthenticated()) {
    res.sendFile(__dirname + '/public/overview.html')
  } else {
    req.session.returnTo = req.originalUrl
    return res.status(403).redirect('/')
  }
})


app.get('/admin', (req, res) => {
  if(req.isAuthenticated() && memberOfAdmin(req.user.memberOf)) {
    res.sendFile(__dirname + '/public/admin.html')
  } else {
    req.session.returnTo = req.originalUrl
    return res.status(403).redirect('/')
  }
})

app.get('/admin/response', (req, res) => {
    if (req.isAuthenticated()  && memberOfAdmin(req.user.memberOf)) {

      const id = req.query.h
      let action = req.query.a
      if(action == 'a') {
        // approve
        action = '2'
      } else if (action == 'd') {
        // deny
        action = '1'
      } else {
        // if gibberish - keep on '?' status
        action = '0'
      }

      const datetimeNow = moment().format('YYYY-MM-DD HH:mm:ss')

      // on request response, first update the DB with approval value
      connection.query(`UPDATE vacations SET approval_datetime = "${datetimeNow}", approved = "${action}" WHERE approval_hash LIKE "${id}";`, (error, results1, fields) => {
        if (error) throw error

        connection.query(`SELECT name, email, submitted_datetime, toDate, fromDate, approved FROM vacations WHERE approval_hash LIKE "${id}";`, (error, results, fields) => {
        if (error) throw error
          
          reqUser = results[0]
          let start = moment.utc(reqUser.fromDate).local().format('YYYY-MM-DD')
          let end = moment.utc(reqUser.toDate).local().format('YYYY-MM-DD')
          let mailStart = moment(start).format('DD.MM.YYYY')
          let mailEnd = moment(end).format('DD.MM.YYYY')
          let userMail = reqUser.email
          let userName = reqUser.name

          if(action == '2') {
            ntvacaCal = process.env.GS_CALID

            let reqDateTime = moment.utc(reqUser.submitted_datetime).local().format('DD.MM.YYYY HH:mm:ss')
            let summary = userName
            let desc = `${userName} Vacation
            
            From: ${mailStart}
            To: ${mailEnd}
            
            Submitted On: ${reqDateTime}
            
            https://vacations.newtelco.de`

            // end + 1 day hack for google calendar
            end = moment(end).local().add(1,'d').format('YYYY-MM-DD')
            addCal(summary, desc, start, end, userMail, ntvacaCal)

            let userSubject = 'Request Approved'
            let userBody = `<html><head> <style>@font-face{font-family: "Lato"; font-style: normal; font-weight: 300; src: local("Lato Light"), local("Lato-Light"), url(https://fonts.gstatic.com/s/lato/v15/S6u9w4BMUTPHh7USSwiPGQ.woff2) format("woff2"); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}@font-face{font-family: "Lato"; font-style: normal; font-weight: 400; src: local("Lato Regular"), local("Lato-Regular"), url(https://fonts.gstatic.com/s/lato/v15/S6uyw4BMUTPHjx4wXg.woff2) format("woff2"); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}html{font-family: Lato, Arial;}img{display: block; margin: auto;}#wrapper{max-width: 600px; margin: 0 auto;}#header{height: 80px; margin: auto 0; background-color: #67B246; width: 100%; text-align: center; line-height: 80px;}#subheader{text-align: center;}h1{font-size: 34px; color: #ffffff; font-weight: 300;}h3{font-size: 18px; font-weight: 900;}hr{width: 90%; height: 3px; border: none; color: #67B246; background-color: #67B246;}#msgBody > p{padding: 15px;}.dateSpan{display: inline-block; width: 45%;}.dateBox{border: 4px solid #8c8c8c; border-radius: 10px; padding: 40px; margin-top: 20px; margin-bottom: 20px; height: 220px;}.dateBox:after{clear: both;}.dateHeader{color: #8c8c8c; display: inline-block; font-size: 28px; text-align: center; width: 100%; font-weight: 800; margin-bottom: 5px;}.fa-calendar-alt{margin-bottom: 5px;}.fa-calendar-alt, .dateText{color: #8c8c8c; display: inline-block; text-align: center; width: 100%;}.dateText{font-size: 22px; font-weight: 900;}.btnWrapper{}.button{margin-top: 10px; display: inline-block; font-size: 24px; font-weight: 900; width: 200px; height: 60px; text-align: center; line-height: 60px; text-decoration: none; color: #ffffff !important; border-radius: 5px;}.negative{margin-left: 70px; background-color: rgba(255, 0, 0, 0.5);}.negative:hover{box-shadow: 0 0 20px 1px rgba(255, 0, 0, 0.7);}.positive{margin-right: 70px; background-color: #67B246; float: right;}.positive:hover{box-shadow: 0 0 20px 1px #67B246;}.footerBar{background-color:#67B246;text-align:center;color:#fff;font-size:16px;font-weight:300;line-height:60px;height:60px;width:100%;margin-top: 40px;}</style></head><body> <div id="wrapper"> <div id="header"> <h1>Vacation Request</h1> </div><div id="subheader"> <h3>Vacation Request Approved</h3> <hr> </div><div id="msgBody"> <p style="margin-bottom:0 !important;font-size: 16px;">Hello ${userName}, <br><br>We would like to inform you that your vacation request has been approved</p><div class="dateBox"> <div style="float: left;" class="dateSpan"> <div class="dateHeader">From</div><img src="https://home.newtelco.de/calendar_icon.png"/> <h2 class="dateText">${mailStart}</h2> </div><div style="float: right;" class="dateSpan"> <div class="dateHeader">To</div><img src="https://home.newtelco.de/calendar_icon.png"/> <h2 class="dateText">${mailEnd}</h2> </div></div></div><div class="footerBar"><3 ndom91  <b>|</b>  NewTelco GmbH</div></div></body></html>`
            sendMsg(userName, userMail, userSubject, userBody)
          } else if (action == '1') {

            let userSubject = 'Request Denied'
            let userBody = `<html><head> <style>@font-face{font-family: "Lato"; font-style: normal; font-weight: 300; src: local("Lato Light"), local("Lato-Light"), url(https://fonts.gstatic.com/s/lato/v15/S6u9w4BMUTPHh7USSwiPGQ.woff2) format("woff2"); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}@font-face{font-family: "Lato"; font-style: normal; font-weight: 400; src: local("Lato Regular"), local("Lato-Regular"), url(https://fonts.gstatic.com/s/lato/v15/S6uyw4BMUTPHjx4wXg.woff2) format("woff2"); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}html{font-family: Lato, Arial;}img{display: block; margin: auto;}#wrapper{max-width: 600px; margin: 0 auto;}#header{height: 80px; margin: auto 0; background-color: #67B246; width: 100%; text-align: center; line-height: 80px;}#subheader{text-align: center;}h1{font-size: 34px; color: #ffffff; font-weight: 300;}h3{font-size: 18px; font-weight: 900;}hr{width: 90%; height: 3px; border: none; color: #67B246; background-color: #67B246;}#msgBody > p{padding: 15px;}.dateSpan{display: inline-block; width: 45%;}.dateBox{border: 4px solid #8c8c8c; border-radius: 10px; padding: 40px; margin-top: 20px; margin-bottom: 20px; height: 220px;}.dateBox:after{clear: both;}.dateHeader{color: #8c8c8c; display: inline-block; font-size: 28px; text-align: center; width: 100%; font-weight: 800; margin-bottom: 5px;}.fa-calendar-alt{margin-bottom: 5px;}.fa-calendar-alt, .dateText{color: #8c8c8c; display: inline-block; text-align: center; width: 100%;}.dateText{font-size: 22px; font-weight: 900;}.btnWrapper{}.button{margin-top: 10px; display: inline-block; font-size: 24px; font-weight: 900; width: 200px; height: 60px; text-align: center; line-height: 60px; text-decoration: none; color: #ffffff !important; border-radius: 5px;}.negative{margin-left: 70px; background-color: rgba(255, 0, 0, 0.5);}.negative:hover{box-shadow: 0 0 20px 1px rgba(255, 0, 0, 0.7);}.positive{margin-right: 70px; background-color: #67B246; float: right;}.positive:hover{box-shadow: 0 0 20px 1px #67B246;}.footerBar{background-color:#67B246;text-align:center;color:#fff;font-size:16px;font-weight:300;line-height:60px;height:60px;width:100%;margin-top: 40px;}</style></head><body> <div id="wrapper"> <div id="header"> <h1>Vacation Request</h1> </div><div id="subheader"> <h3>Vacation Request Denied</h3> <hr> </div><div id="msgBody"> <p style="margin-bottom:0 !important;font-size: 16px;">Hello ${userName}, <br><br>We regret to inform you, that your vacation request has been denied.</p><div class="dateBox"> <div style="float: left;" class="dateSpan"> <div class="dateHeader">From</div><img src="https://home.newtelco.de/calendar_icon.png"/> <h2 class="dateText">${mailStart}</h2> </div><div style="float: right;" class="dateSpan"> <div class="dateHeader">To</div><img src="https://home.newtelco.de/calendar_icon.png"/> <h2 class="dateText">${mailEnd}</h2> </div></div></div><div class="footerBar"><3 ndom91  <b>|</b>  NewTelco GmbH</div></div></body></html>`
            sendMsg(userName, userMail, userSubject, userBody)
          }

          if(results1.affectedRows > 0) {
            res.sendFile(__dirname + "/public/responseSuccess.html")
          } else {
            res.sendFile(__dirname + "/public/responseError.html")
          }
        })
        // TO DO: save req URL and pass it into login path to redirect
        //    after successful login incase manager isnt pre-logged in 
        //    when approving vacation request
      })


    } else {
      console.error('not Authenticated!')
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/?response=2')
    }
})

app.post('/admin/users', (req, res) => {
    if (req.isAuthenticated() && memberOfAdmin(req.user.memberOf)) {

      connection.query('SELECT DISTINCT name, email FROM vacations ORDER BY name', (error, results, fields) => {
        if (error) throw error
        // res.end(JSON.stringify(results))
        return res.status(202).send(results)
      })
    } else {
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/')
    }
})

app.post('/admin/managers', (req, res) => {
    if (req.isAuthenticated() && memberOfAdmin(req.user.memberOf)) {

      connection.query('SELECT * FROM managers', (error, results, fields) => {
        if (error) throw error
        // res.end(JSON.stringify(results))
        return res.status(202).send(results)
      })
    } else {
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/')
    }
})

app.post('/admin/managers/update', (req, res) => {
    if (req.isAuthenticated() && memberOfAdmin(req.user.memberOf)) {

      body = req.body
      const id = body.id
      const name = body.name
      const email = body.email

      connection.query(`UPDATE managers SET name = "${name}", email = "${email}" WHERE id LIKE "${id}";`, (error, results, fields) => {
        if (error) throw error
        // res.end(JSON.stringify(results))
        return res.status(202).send(results)
      })
    } else {
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/')
    }
})

app.post('/admin/managers/add', (req, res) => {
    if (req.isAuthenticated() && memberOfAdmin(req.user.memberOf)) {

      body = req.body
      const id = body.id
      const name = body.name
      const email = body.email

      connection.query(`INSERT INTO managers SET name = "${name}", email = "${email}";`, (error, results, fields) => {
        if (error) throw error
        return res.status(202).send(results)
      })
    } else {
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/')
    }
})

app.post('/report/year', (req, res) => {
    if (req.isAuthenticated()) {

      body = req.body
      const year = body.year 

      connection.query(`SELECT * FROM vacations WHERE YEAR(fromDate) = "${year}" OR YEAR(toDate) = "${year}";`, (error, results, fields) => {
        if (error) throw error
        return res.status(202).send(results)
      })
    } else {
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/')
    }
})

app.post('/report/month', (req, res) => {
    if (req.isAuthenticated() && memberOfAdmin(req.user.memberOf)) {

      body = req.body
      const month = body.month
      const year = body.year 

      connection.query(`SELECT * FROM vacations WHERE (MONTH(toDate) = "${month}" AND YEAR(toDate) = "${year}") OR (MONTH(fromDate) = "${month}" AND YEAR(fromDate) = "${year}");`, (error, results, fields) => {
        if (error) throw error
        return res.status(202).send(results)
      })
    } else {
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/')
    }
})

app.post('/admin/vacations/delete', (req, res) => {
    if (req.isAuthenticated() && memberOfAdmin(req.user.memberOf)) {

     body = req.body

     connection.query(`DELETE FROM vacations WHERE id IN (${body});`, (error, results, fields) => {
        if (error) throw error
        return res.status(202).send(results)
      })
    } else {
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/')
    }
})

app.post('/admin/managers/delete', (req, res) => {
    if (req.isAuthenticated() && memberOfAdmin(req.user.memberOf)) {

      body = req.body
      const id = body.id

      connection.query(`DELETE FROM managers WHERE id = "${id}";`, (error, results, fields) => {
        if (error) throw error
        return res.status(202).send(results)
      })
    } else {
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/')
    }
})

app.post('/admin/listall', (req, res) => {
    if (req.isAuthenticated() && memberOfAdmin(req.user.memberOf)) {

      connection.query('SELECT id, name, resturlaubVorjahr, jahresurlaubInsgesamt, restjahresurlaubInsgesamt, beantragt, resturlaubJAHR, fromDate, toDate, manager, note, submitted_datetime, approval_hash, approved, approval_datetime FROM vacations;', (error, results, fields) => {
        if (error) throw error
        return res.status(202).send(results)
      })
    } else {
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/')
    }
})

app.post('/vacation/user', (req, res) => {
    if (req.isAuthenticated() == true) {

      user = req.user

      return res.status(202).send(user)
    } else {
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/')
    }
})

app.post('/vacation/list', (req, res) => {
    if (req.isAuthenticated() == true) {

      if(req.body.username){
        user = req.body.username
      } else {
        user = req.user.sAMAccountName
      }

      connection.query(`SELECT resturlaubVorjahr, jahresurlaubInsgesamt, restjahresurlaubInsgesamt, beantragt, resturlaubJAHR, fromDate, toDate, manager, note, submitted_datetime, approved FROM vacations WHERE submitted_by LIKE "${user}";`, (error, results, fields) => {
        if (error) throw error
        return res.status(202).send(results)
      })
    } else {
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/')
    }
})

app.post('/request/managers', (req, res) => {
    if (req.isAuthenticated() == true) {

      connection.query('SELECT * FROM managers', (error, results, fields) => {
        if (error) throw error
        return res.status(202).send(results)
      })
    } else {
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/')
    }
})

app.post('/request/submit', (req, res) => {
    if (req.isAuthenticated() == true) {

      user = req.user

      let newVaca = req.body

      let approval_hash = uuid()
      approval_hash = approval_hash.replace(/-/g, '')
      const submitted_datetime = DateTime.local().toFormat('kkkk-MM-dd HH:mm:ss')
      const toDATE = DateTime.fromFormat(newVaca.toDate, 'LLLL d, yyyy').toISODate()
      const fromDATE = DateTime.fromFormat(newVaca.fromDate, 'LLLL d, yyyy').toISODate()

      newVaca['toDate'] = toDATE
      newVaca['fromDate'] = fromDATE
      newVaca['submitted_by'] = user.sAMAccountName
      newVaca['submitted_datetime'] = submitted_datetime
      newVaca['approval_hash'] = approval_hash

      connection.query('INSERT INTO vacations SET ?', newVaca, (error, results, fields) => {
        if (error) throw error
        return res.status(202).send(results)
      })

      // MANAGER APPROVE / DENY REQUEST
      const reqUser = newVaca['name']
      const reqfromDate = moment(newVaca['fromDate']).format('ddd MMM Do, YYYY')
      const reqtoDate = moment(newVaca['toDate']).format('ddd MMM Do, YYYY')
      const dateToday = moment().format('DD.MM.YYYY')
      let msgSubject = `Request by ${newVaca['name']} [${newVaca['fromDate']} to ${newVaca['toDate']}]`
      let mgrMail = newVaca['manager']
      let optNote = ''
      if(newVaca['note'] != '') {
        const fName = reqUser.substr(0,reqUser.indexOf(' '));
        optNote = `<p style="margin-top: 0 !important; font-size: 16px;"><b>Note from ${fName}:<br></b>${newVaca['note']}</p>`
      } else {
        optNote = ''
      }
      let msgBody = `<html><head> <style>@font-face{font-family: "Lato"; font-style: normal; font-weight: 300; src: local("Lato Light"), local("Lato-Light"), url(https://fonts.gstatic.com/s/lato/v15/S6u9w4BMUTPHh7USSwiPGQ.woff2) format("woff2"); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}@font-face{font-family: "Lato"; font-style: normal; font-weight: 400; src: local("Lato Regular"), local("Lato-Regular"), url(https://fonts.gstatic.com/s/lato/v15/S6uyw4BMUTPHjx4wXg.woff2) format("woff2"); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}html{font-family: Lato, Arial;}img{display: block; margin: auto;}#wrapper{max-width: 600px; margin: 0 auto;}#header{height: 80px; margin: auto 0; background-color: #67B246; width: 100%; text-align: center; line-height: 80px;}#subheader{text-align: center;}h1{font-size: 34px; color: #ffffff; font-weight: 300;}h3{font-size: 18px; font-weight: 900;}hr{width: 90%; height: 3px; border: none; color: #67B246; background-color: #67B246;}#msgBody > p{padding: 15px;}.dateSpan{display: inline-block; width: 45%;}.dateBox{border: 4px solid #8c8c8c; border-radius: 10px; padding: 40px; margin-top: 20px; margin-bottom: 20px; height: 220px;}.dateBox:after{clear: both;}.dateHeader{color: #8c8c8c; display: inline-block; font-size: 28px; text-align: center; width: 100%; font-weight: 800; margin-bottom: 5px;}.fa-calendar-alt{margin-bottom: 5px;}.fa-calendar-alt, .dateText{color: #8c8c8c; display: inline-block; text-align: center; width: 100%;}.dateText{font-size: 22px; font-weight: 900;}.btnWrapper{}.button{margin-top: 10px; display: inline-block; font-size: 24px; font-weight: 900; width: 200px; height: 60px; text-align: center; line-height: 60px; text-decoration: none; color: #ffffff !important; border-radius: 5px;}.negative{margin-left: 70px; background-color: rgba(255, 0, 0, 0.5);}.negative:hover{box-shadow: 0 0 20px 1px rgba(255, 0, 0, 0.7);}.positive{margin-right: 70px; background-color: #67B246; float: right;}.positive:hover{box-shadow: 0 0 20px 1px #67B246;}.footerBar{background-color:#67B246;text-align:center;color:#fff;font-size:16px;font-weight:300;line-height:60px;height:60px;width:100%;margin-top: 40px;}</style></head><body> <div id="wrapper"> <div id="header"> <h1>Vacation Request</h1> </div><div id="subheader"> <h3>New Vacation Request from ${reqUser}</h3> <hr> </div><div id="msgBody"> <p style="margin-bottom:0 !important;font-size: 16px;"> There has been a new vacation request from ${reqUser} <br><br>Please approve or deny this request below. This user will be notified via email of your decision. </p>${optNote}<div class="dateBox"> <div style="float: left;" class="dateSpan"> <div class="dateHeader">From</div><img src="https://home.newtelco.de/calendar_icon.png"/> <h2 class="dateText">${reqfromDate}</h2> </div><div style="float: right;" class="dateSpan"> <div class="dateHeader">To</div><img src="https://home.newtelco.de/calendar_icon.png"/> <h2 class="dateText">${reqtoDate}</h2> </div></div><div class="btnWrapper"> <a href="${process.env.BASE_URL}/admin/response?h=${approval_hash}&a=d" class="button negative">Deny</a> <a href="${process.env.BASE_URL}/admin/response?h=${approval_hash}&a=a" class="button positive">Approve</a> </div></div><div class="footerBar">${dateToday}  <b>|</b>  <3 ndom91  <b>|</b>  NewTelco GmbH</div></div></body></html>`

      mgrName = mgrMail.substring(0, mgrMail.lastIndexOf("@"));

      // const ccMail = "yo@ni.co.de"
      
      // if(mgrName = 'nhartmann') {
      //   sendMsg(mgrName, mgrMail, msgSubject, msgBody)
      // } else {
      //   sendMsg(mgrName, mgrMail, msgSubject, msgBody, ccMail)
      // }

      sendMsg(mgrName, mgrMail, msgSubject, msgBody)


    } else {
      req.session.returnTo = req.originalUrl
      return res.status(403).redirect('/')
    }
})

port = process.env.WEB_PORT || 7555
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
