<img src="https://vacation.newtelco.de/nt_vacation.png" width="64" height="64">
<b>Newtelco Vacation Application</b>   

[![newtelco](https://img.shields.io/badge/Version-1.0.0-brightgreen.svg?style=flat-square)](https://vacation.newtelco.de)
[![Uptime Robot ratio (7 days)](https://img.shields.io/uptimerobot/ratio/7/m782611716-65dcf538faa88508adee4abe.svg?style=flat-square&colorB=brightgreen&label=Uptime)](https://uptime.newtelco.de/)
[![pipeline status](https://git.newtelco.dev/newtelco/vacation_node/badges/master/pipeline.svg?style=flat-square)](https://git.newtelco.dev/newtelco/vacation_node/commits/master)


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
3. Run `npm start`  
4. Visit `http://localhost:7555` or reverse proxy that port out  

> If you would like for this to run in production, I suggest setting up [pm2](https://pm2.io/runtime/) to run / manage / monitor the process. 

## Development

1. Clone this repo
2. Run `npm install`
3. Run `npm run start:dev`
  > This will run `nodemon` - a nice live reloading dev server on port 7666
4. Visit `http://localhost:7666`

## Contributing  

- Just clone this repo and run `npm run start:dev` to get the dev env up and running.

[AGPLv3 Licence](https://opensource.org/licenses/AGPL-3.0)  
