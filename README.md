<img src="https://vacation.newtelco.de/nt_vacation.png" width="64" height="64">

## Company Vacation Web App  

![GitHub package.json version](https://img.shields.io/github/package-json/v/ndom91/companyvacations.svg?style=flat-square)
![dependencies](https://img.shields.io/david/dev/ndom91/CompanyVacations.svg?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues-raw/ndom91/CompanyVacations.svg?style=flat-square)

> Built on [node](https://nodejs.org/en/) and [express](https://expressjs.com/)  

## Screenshots

<img src="https://imgur.com/egNW1Le.png" width="860" height="546">
<img src="https://imgur.com/fQHe279.png" width="860" height="546">
<img src="https://imgur.com/17MzvvK.png" width="860" height="546">

## Features

- Vacation Management  
- Login via LDAP  
- Make Vacation Request  
- Admin Portal  
- Request Approval or Denial via Email and/or in Admin Portal  
- Monthly / Yearly report exports to Excel file  
- Show shared Google Cal on homepage for user overview  
- Create Google Cal event on Request Approval

## Setup  

General: 

1. Replace your GCal API Key / User Email with the placeholders in `public/dashboard.js` 
2. Optional: In `public/request.js` lines 88-102, you can uncomment and adjust the `CN=Group` and the associated email address in order to prefill the manager selection based on their OU in AD if you'd like. 

Prerequisites:  
1. LDAP / AD   
2. G Suite Service Account  
    2.1. Domain-Wide Delegation must be enabled, as well as the Gmail API and Calendar API  
    2.2. You must set the appropriate API scopes in G Suite Admin.  
        2.2.1. Get you client ID for your service account, and go to "Security" -> "Advanced Settings" -> "Manage API client access"   
        2.2.2. Enter your client ID and the following scopes: `https://mail.google.com/, https://www.googleapis.com/auth/calendar, https://www.googleapis.com/auth/calendar.events`   
    2.3. Finally, grant the account you've defined under `GS_USER` in the config.env file **write** rights to the vacation calendar you'd like to have vacations added to.   

### Production

1. Clone this repo  
2. Run `npm install`  
3. Setup DB `mysql -uUSER -p DB_NAME < createDB.sql`
4. Create config.env `cp config.template.env config.env` and fill out
5. Run `npm start`  
6. Visit `http://localhost:7555` or reverse proxy that port out  

> If you would like for this to run in production, I suggest setting up [pm2](https://pm2.io/runtime/) to run / manage / monitor the process. 

### Development

1. Clone this repo
2. Run `npm install`
3. Setup DB `mysql -uUSER -p DB_NAME < createDB.sql`
4. Create config.env `cp config.template.env config.env` and fill out
5. Run `npm run start:dev`
  > This will run `nodemon` - a nice live reloading dev server on port 7666
6. Visit `http://localhost:7666`

## To-Dos

1. I want to make this more "multi-tenant" friendly. If anyone has any experience putting more variables into .html, etc. which can be filled based on a .env config value, or something similar, please let me know!

Many of these things in my specific implementation were swapped out via `sed` commands in my .gitlab-ci.yml build process. But that obviously doesnt exist automatically for all users of this application.. 

2. Language Strings - I know this is currently kind of a mix between German / English. All the important strings / text are in English, but some variable names and such are still in German. This definitely needs to be cleaned up and possibly all strings pulled out into another file so that it can be easily translated.  

3. Rethink database requirement - I think there is so little DB access / requirements that we could get away with running this with a simply SQLite DB. Since I dont have much experience with it though I dont know where the cutoff is to where you should use a legit mysql db and if this application exceeds that limit. It would definitely make setup and management thereof much easier. 

## Contributing  

- Just clone this repo and run `npm run start:dev` to get the dev env up and running.

![GitHub](https://img.shields.io/github/license/ndom91/companyvacations.svg?style=flat-square)
