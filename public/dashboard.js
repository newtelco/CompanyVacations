/**
 * @summary NewTelco GmbH Vacation Application
 * @author Nico Domino <yo@ni.co.de>
 * @license AGPLv3
 */

const calEl = document.getElementById('calEl')

let calendar = new FullCalendar.Calendar(calEl, {
    plugins: [ 'dayGrid', 'googleCalendar' ],
    googleCalendarApiKey: 'GS_CAL_APIKEY',
    events: {
        googleCalendarId: 'newtelco.de_a2nm4ggh259c68lmim5e0mpp8o@group.calendar.google.com'
    },
    height: 600
})

calendar.render()
