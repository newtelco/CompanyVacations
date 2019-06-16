<img src="https://vacation.newtelco.de/nt_vacation.png" width="64" height="64">
#### Company Vacation Web App  

![GitHub package.json version](https://img.shields.io/github/package-json/v/ndom91/companyvacations.svg?style=flat-square)
![dependencies](https://img.shields.io/david/dev/ndom91/CompanyVacations.svg?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues-raw/ndom91/CompanyVacations.svg?style=flat-square)

> Built on [node](https://nodejs.org/en/) and [express](https://expressjs.com/)  

## Screenshots

<img src="http://i.imgur.com/fcEAzvM.png" width="860" height="546">
<img src="http://i.imgur.com/cWbc0X3.png" width="860" height="546">
<img src="http://i.imgur.com/Zn7GZg8.png" width="860" height="546">

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

Prerequisites:  
1. LDAP / AD   
2. G Suite Service Account  
    2.1. Domain-Wide Delegation must be enabled, as well as the Gmail API and Calendar API  
    2.2. You must set the appropriate API scopes in G Suite Admin.  
        2.2.1. Get you client ID for your service account, and go to "Security" -> "Advanced Settings" -> "Manage API client access"   
        2.2.2. Enter your client ID and the following scopes: `https://mail.google.com/, https://www.googleapis.com/auth/calendar, https://www.googleapis.com/auth/calendar.events`   
    2.3. Finally, grant the account you've defined under `GS_USER` in the config.env file **write** rights to the vacation calendar you'd like to have vacations added to.   


Once that has been setup, please:  

1. Clone this repo  
2. Run `npm install`  
3. Create config.env `cp config.template.env config.env` and fill out
4. Run `npm start`  
5. Visit `http://localhost:7555` or reverse proxy that port out  

> If you would like for this to run in production, I suggest setting up [pm2](https://pm2.io/runtime/) to run / manage / monitor the process. 

## Development

1. Clone this repo
2. Run `npm install`
3. Create config.env `cp config.template.env config.env` and fill out
4. Run `npm run start:dev`
  > This will run `nodemon` - a nice live reloading dev server on port 7666
5. Visit `http://localhost:7666`

## Contributing  

- Just clone this repo and run `npm run start:dev` to get the dev env up and running.

![GitHub](https://img.shields.io/github/license/ndom91/companyvacations.svg?style=flat-square)
