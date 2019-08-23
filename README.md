<img align="right" src="https://vacation.newtelco.de/nt_vacation.png" width="190" height="190">

## 🌴 Company Vacation Web App  

![GitHub package.json version](https://img.shields.io/github/package-json/v/ndom91/companyvacations.svg?style=flat-square)
![dependencies](https://img.shields.io/david/dev/ndom91/CompanyVacations.svg?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues-raw/ndom91/CompanyVacations.svg?style=flat-square)  

> Built on [node](https://nodejs.org/en/), [express](https://expressjs.com/), [fomantic-ui](https://fomantic-ui.com), [google apis](https://github.com/googleapis/google-api-nodejs-client), and 💚  

## 🛠️ Features

- [x] Vacation Management  
- [x] Login via LDAP  
- [x] Make Vacation Request  
- [x] Admin Portal  
- [x] Request Approval or Denial via Email and/or in Admin Portal  
- [x] Monthly / Yearly report exports to Excel file  
- [x] Show shared Google Cal on homepage for user overview  
- [x] Create Google Cal event on Request Approval

## 🏁 Setup  

**General**: 

1. Replace your GCal API Key / User Email with the placeholders in `public/dashboard.js` 
2. Optional: In `public/request.js` lines 88-102, you can uncomment and adjust the `CN=Group` and the associated email address in order to prefill the manager selection based on their OU in AD if you'd like. 

**Prerequisites**:  
1. LDAP / AD   
2. G Suite Service Account  
    2.1. Domain-Wide Delegation must be enabled, as well as the Gmail API and Calendar API  
    2.2. You must set the appropriate API scopes in G Suite Admin.  
        2.2.1. Get you client ID for your service account, and go to "Security" -> "Advanced Settings" -> "Manage API client access"   
        2.2.2. Enter your client ID and the following scopes: `https://mail.google.com/, https://www.googleapis.com/auth/calendar, https://www.googleapis.com/auth/calendar.events`   
    2.3. Finally, grant the account you've defined under `GS_USER` in the config.env file **write** rights to the vacation calendar you'd like to have vacations added to.   

### 💯 Production

1. Clone this repo  
2. Run `npm install`  
3. Setup DB `mysql -uUSER -p DB_NAME < createDB.sql`
4. Create config.env `cp config.template.env config.env` and fill out
5. Run `npm start`  
6. Visit `http://localhost:7555` or reverse proxy that port out  

> If you would like for this to run in production, I suggest setting up [pm2](https://pm2.io/runtime/) to run / manage / monitor the process. 

### 💻 Development

1. Clone this repo
2. Run `npm install`
3. Setup DB `mysql -uUSER -p DB_NAME < createDB.sql`
4. Create config.env `cp config.template.env config.env` and fill out
5. Run `npm run start:dev`
  > This will run `nodemon` - a nice live reloading dev server on port 7666
6. Visit `http://localhost:7666`

## 📺 Screenshots

<img src="https://imgur.com/egNW1Le.png" width="860" height="546">
<img src="https://imgur.com/fQHe279.png" width="860" height="546">
<img src="https://imgur.com/17MzvvK.png" width="860" height="546">

## 🔨 Todos

1. I want to make this more **"multi-tenant"** friendly. According to the 12-factor app methodology, we should be putting everything that is adjustable in the environment / a config file. The javascript variables are mostly taken care of, however, I need to template some more of the HTML and make that configurable as well.

2. **Language Strings** - Currently the strings in this application an awful mix of German / English. This needs to be standardized on English and the option given for other languages (German, etc.) via extensible strings files.

3. **Rethink database requirement** - Due to the fact that the requirements for persistence / statefulness of this application are relatively low, I've been debating moving to SQLite instead of a full fledged MySQL DB for this application. However, I have only limited exerience with SQLite so I'm not positive where, in terms of size / amount of data, the break point is between SQLite and MySQL databases and how appoproriate SQLite could be for this. SQLite would make the setup, maintenance, and deployment of this application much easier.

## 👥 Contributing  

- Just clone this repo, install the dependencies `npm install` and run `npm run start:dev` to get the dev environment up and running.

## 📝 License
![Github Licence](https://img.shields.io/github/license/ndom91/companyvacations.svg?style=flat-square)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fndom91%2FCompanyVacations.svg?type=small)](https://app.fossa.io/projects/git%2Bgithub.com%2Fndom91%2FCompanyVacations?ref=badge_small)
