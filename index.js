const express = require('express')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const bodyParser = require('body-parser')
const passport = require('passport')
const ldapstrategy = require('passport-ldapauth')
const mysql = require('mysql')
const { DateTime } = require('luxon')
const uuid = require('uuid/v4')
let {google} = require('googleapis')
let privatekey = require('./nt_gsuite_priv.json')

function sendMsg(userName, userMail, subject, body) {
  (() => {
  "use strict";
  const google_key = require("./nt_gsuite_priv.json"); 

  subject = '[VACATION] ' + subject
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    'From: Newtelco Vacations <device@newtelco.de>',
    'To: ' + userName + ' <' + userMail + '>',
    // 'To: Nico Domino <ndomino@newtelco.de>',
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    body,
    '',
    // '<b>Hello!</b>  🤘❤️😎',
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
    'device@newtelco.de' 
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
        userId: 'device@newtelco.de',
        resource: {
          raw: encodedMessage
        }
      }, (err, messages) => {
        //will print out an array of messages plus the next page token
        console.log(err);
        console.dir(messages);
      });
    })() 
  ));
})();
}

var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'ntvacations',
  password : 'N3wt3lco',
  database : 'ntvacations',
  port     : 3306
})

connection.connect((err) => {
    if (err) throw err
    console.log('You are now connected...')
})

var OPTS = {
    server: {
        url: 'ldap://ldap.newtelco.dev:389',
        bindDN: 'cn=jcleese,ou=technik,ou=users,ou=frankfurt,dc=newtelco,dc=local',
        bindCredentials: 'N3wt3lco',
        searchBase: 'ou=users,ou=frankfurt,dc=newtelco,dc=local',
        searchFilter: '(cn={{username}})'
    }
}

const app = express()
passport.use(new ldapstrategy(OPTS))

app.use(session({
    secret: 'ldap secret',
    resave: false,
    saveUninitialized: true,
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


// Handle the different routes
// create the homepage route at '/'
app.get('/', (req, res) => {
  console.log('Inside the homepage callback function')
  console.log(`User authenticated? ${req.isAuthenticated()}`)
  if(req.isAuthenticated()) {
    res.redirect('/dashboard.html')
  }
})

app.get('/login', (req, res) => {
    console.log('Inside the /login GET callback')
    console.log(req.sessionID)
    res.send(`You got to the login page!\n`)
})

app.post('/login', (req, res, next) => {
  passport.authenticate('ldapauth', {session: false}, (err, user, info) => {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (! user) {
      console.log('\nRequest Login failed!')
      return res.send({ success : false, message : 'authentication failed' });
    }
    req.login(user,(err) => {
        if (err) return next(err)
        console.log('Request Login successful')
        return res.redirect('dashboard')
    })
  })(req, res, next);
});

app.get('/logout', (req, res) => {
  //req.session.destroy()
  req.logout()
  return res.redirect('/')
})

app.get('/dashboard', (req, res) => {
  var user = req.user
  // TEST
  for(i = 0; i < user.memberOf.length; i++) {
    console.log(user.memberOf[i])
  }
  console.log('\nInside GET /dashboard callback')
  console.log(`User authenticated? ${req.isAuthenticated()}`)
  if(req.isAuthenticated()) {
    res.sendFile(__dirname + '/public/dashboard.html')
  } else {
    return res.redirect('/')
  }
})

app.get('/request', (req, res) => {
  console.log('\nInside GET /request callback')
  console.log(`User authenticated? ${req.isAuthenticated()}`)
  if(req.isAuthenticated()) {
    res.sendFile(__dirname + '/public/request.html')
  } else {
    return res.redirect('/')
  }
})


app.get('/overview', (req, res) => {
  console.log('\nInside GET /overview callback')
  console.log(`User authenticated? ${req.isAuthenticated()}`)
  if(req.isAuthenticated()) {
    res.sendFile(__dirname + '/public/overview.html')
  } else {
    return res.redirect('/')
  }
})


app.get('/admin', (req, res) => {
  console.log('\nInside GET /admin callback')
  console.log(`User authenticated? ${req.isAuthenticated()}`)
  if(req.isAuthenticated()) {
    res.sendFile(__dirname + '/public/admin.html')
  } else {
    return res.redirect('/')
  }
})

app.post('/admin/users', (req, res) => {
    if (req.isAuthenticated() == true) {

      connection.query('SELECT DISTINCT name, email FROM vacations ORDER BY name', (error, results, fields) => {
        if (error) throw error
        // res.end(JSON.stringify(results))
        return res.status(202).send(results)
      })
    } else {
      return res.status(403).send('Forbidden!')
    }
})

app.post('/admin/managers', (req, res) => {
    if (req.isAuthenticated() == true) {

      connection.query('SELECT * FROM managers', (error, results, fields) => {
        if (error) throw error
        // res.end(JSON.stringify(results))
        return res.status(202).send(results)
      })
    } else {
      return res.status(403).send('Forbidden!')
    }
})

app.post('/admin/managers/update', (req, res) => {
    if (req.isAuthenticated() == true) {

      body = req.body
      console.log(body)
      const id = body.id
      console.log(id)
      const name = body.name
      const email = body.email

      connection.query('UPDATE managers SET name = "' + name + '", email = "' + email + '" WHERE id LIKE "' + id + '";', (error, results, fields) => {
        if (error) throw error
        // res.end(JSON.stringify(results))
        return res.status(202).send(results)
      })
    } else {
      return res.status(403).send('Forbidden!')
    }
})

app.post('/admin/listall', (req, res) => {
    if (req.isAuthenticated() == true) {

      connection.query('SELECT name, resturlaubVorjahr, jahresurlaubInsgesamt, restjahresurlaubInsgesamt, beantragt, resturlaubJAHR, fromDate, toDate, manager, note, submitted_datetime, approved, approval_datetime FROM vacations;', (error, results, fields) => {
        if (error) throw error
        // res.end(JSON.stringify(results))
        return res.status(202).send(results)
      })
    } else {
      return res.status(403).send('Forbidden!')
    }
})

app.post('/vacation/user', (req, res) => {
    if (req.isAuthenticated() == true) {

      user = req.user
      return res.status(202).send(user)
    } else {
      return res.status(403).send('Forbidden!')
    }
})

app.post('/vacation/list', (req, res) => {
    if (req.isAuthenticated() == true) {

      if(req.body.username){
        user = req.body.username
      } else {
        user = req.user.sAMAccountName
      }

      connection.query('SELECT resturlaubVorjahr, jahresurlaubInsgesamt, restjahresurlaubInsgesamt, beantragt, resturlaubJAHR, fromDate, toDate, manager, note, submitted_datetime, approved FROM vacations WHERE submitted_by LIKE "'+ user + '";', (error, results, fields) => {
        if (error) throw error
        // res.end(JSON.stringify(results))
        return res.status(202).send(results)
      })
    } else {
      return res.status(403).send('Forbidden!')
    }
})

app.post('/vacation/submit', (req, res) => {
    if (req.isAuthenticated() == true) {

      user = req.user

      let newVaca = req.body

      console.log(newVaca)

      const approval_hash = uuid()
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
        // res.end(JSON.stringify(results))
        return res.status(202).send(results)
      })

      // SEND MAIL - GOOGLE API CLIENT?
      const reqUser = newVaca['name']
      const reqfromDate = newVaca['fromDate']
      const reqtoDate = newVaca['toDate']
      let msgSubject = 'Request by ' + newVaca['name'] + ' [' + newVaca['fromDate'] + ' to ' + newVaca['toDate'] + ']'
      let mgrMail = newVaca['manager']
      let msgBody = '<html><head><style>@font-face{font-family: \'Lato\'; font-style: normal; font-weight: 300; src: local(\'Lato Light\'), local(\'Lato-Light\'), url(https://fonts.gstatic.com/s/lato/v15/S6u9w4BMUTPHh7USSwiPGQ.woff2) format(\'woff2\'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}@font-face{font-family: \'Lato\'; font-style: normal; font-weight: 400; src: local(\'Lato Regular\'), local(\'Lato-Regular\'), url(https://fonts.gstatic.com/s/lato/v15/S6uyw4BMUTPHjx4wXg.woff2) format(\'woff2\'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}html{font-family: Lato, Arial;}img{display: block; margin: auto;}#wrapper{max-width: 500px; margin: 0 auto;}#header{height: 60px; margin: auto 0; background-color: #67B246; width: 100%; text-align: center; line-height: 60px;}#subheader{text-align: center;}h1{font-weight:300;}h3{font-weight:900;}hr{width: 90%; height:3px; border:none; color:#67B246; background-color: #67B246;}#msgBody > p{padding: 15px;}.dateSpan{display: inline-block; width: 40%;}.dateBox{border: 4px solid #8c8c8c; border-radius: 10px; padding: 40px; margin-top: 20px; margin-bottom: 20px; height: 150px;}.dateBox:after{clear: both;}.fa-calendar-alt{margin-bottom: 5px;}.fa-calendar-alt, .dateText{color: #8c8c8c; display: inline-block; text-align: center; width: 100%;}.btnWrapper{}.button{margin-top: 10px; display: inline-block; width: 200px; height: 60px; text-align: center; line-height: 60px; text-decoration: none; color: #fff; border-radius: 5px;}.negative{margin-left: 30px; background-color: rgba(255,0,0,0.7);}.negative:hover{box-shadow: 0 0 20px 1px rgba(255,0,0,0.7);}.positive{margin-right: 30px; background-color: #67B246; float: right;}.positive:hover{box-shadow: 0 0 20px 1px #67B246;}</style></head><body><div id="wrapper"> <div id="header"> <h1>Vacation Request</h1> </div><div id="subheader"> <h3>New Vacation Request from ' + reqUser + '</h3> <hr> </div><div id="msgBody"> <p> There has been a new vacation request from ' + reqUser + ' <br><br>Please approve or deny this request below. The user will be informed via email of your decision. </p><div class="dateBox"> <div style="float: left;" class="dateSpan"> <img src="https://home.newtelco.de/calendar_icon.png"/> <h2 class="dateText">' + reqfromDate + '</h2> </div><div style="float: right;" class="dateSpan"> <img src="https://home.newtelco.de/calendar_icon.png"/> <h2 class="dateText">' + reqtoDate + '</h2> </div></div><div class="btnWrapper"> <a href="" class="button negative">Deny</a> <a href="" class="button positive">Approve</a> </div></div></div></body></html>'


      mgrName = mgrMail.substring(0, mgrMail.lastIndexOf("@"));

      sendMsg(mgrName, mgrMail, msgSubject, msgBody)

      // function sendMsg(userName, userMail, subject, body) 
      
      //Google Calendar API
      // let calendar = google.calendar('v3');
      // calendar.events.list({
      //   auth: jwtClient,
      //   calendarId: 'newtelco.de_a2nm4ggh259c68lmim5e0mpp8o@group.calendar.google.com'
      // }, function (err, response) {
      //   if (err) {
      //       console.log('The API returned an error: ' + err);
      //       return;
      //   }
      //   var events = response.items;
      //   if (events.length == 0) {
      //       console.log('No events found.');
      //   } else {
      //       console.log('Event from Google Calendar:');
      //       for (let event of response.items) {
      //           console.log('Event name: %s, Creator name: %s, Create date: %s', event.summary, event.creator.displayName, event.start.date);
      //       }
      //   }
      // });

    } else {
      return res.status(403).send('Forbidden!')
    }
})

app.listen(7555, () => {
    console.log('Server running on http://localhost:7555')
})
