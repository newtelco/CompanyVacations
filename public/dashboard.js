
const calEl = document.getElementById('calEl')

let calendar = new FullCalendar.Calendar(calEl, {
    plugins: [ 'dayGrid', 'googleCalendar' ],
    googleCalendarApiKey: 'AIzaSyAORiEAqkItdCeiTi77TMxQvMng1xEhoo0',
    events: {
        googleCalendarId: 'newtelco.de_a2nm4ggh259c68lmim5e0mpp8o@group.calendar.google.com'
    },
    height: 600
})

calendar.render()