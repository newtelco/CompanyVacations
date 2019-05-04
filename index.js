const express = require('express')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const bodyParser = require('body-parser')
const passport = require('passport')
const ldapstrategy = require('passport-ldapauth')
const mysql = require('mysql')
const { DateTime } = require('luxon')
const uuid = require('uuid/v4')

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

      user = req.user.sAMAccountName

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
    } else {
      return res.status(403).send('Forbidden!')
    }
})

app.listen(7555, () => {
    console.log('Server running on http://localhost:7555')
})
