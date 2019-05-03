const express = require('express')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const bodyParser = require('body-parser')
const passport = require('passport')
const ldapstrategy = require('passport-ldapauth')
const uuid = require('uuid')

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

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

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

app.post('/login', function(req, res, next) {
  passport.authenticate('ldapauth', {session: false}, function(err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (! user) {
      console.log('\nRequest Login failed!')
      return res.send({ success : false, message : 'authentication failed' });
    }
    req.login(user,function(err) {
        if (err) return next(err)
        console.log('Request Login successful')
        return res.redirect('dashboard')
    })
  })(req, res, next);
});

// Handle the different routes

app.get('/logout', (req, res) => {
  req.session.destroy()
  req.logout()
  return res.redirect('/')
})

app.get('/dashboard', (req, res) => {
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
app.listen(7555, () => {
    console.log('Server running on http://localhost:7555')
})

