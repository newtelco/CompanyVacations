function UserInfo(verb) {
    fetch('/vacation/user', {
        method: 'POST',
        credentials: 'include',
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
    .then(response => response.json())
    .then(data => {
        if(verb == 'set') {
            window.sessionStorage.setItem('user',JSON.stringify(data))
        } else if (verb == 'get') {
            return data.sAMAccountName
        }
    })
    .catch(error => console.error(error))
}

// check sessionStorage - if another user is saved there
// already, then compare and save new User
if(window.sessionStorage.getItem('user') === null) {
    UserInfo('set')    
} else {
    user = window.sessionStorage.getItem('user')
    user = JSON.parse(user)
    savedUser = UserInfo('get')
    if(user.sAMAccountName != savedUser) {
        UserInfo('set')
    }
}

const calEl = document.getElementById('calEl')

let calendar = new FullCalendar.Calendar(calEl, {
    plugins: [ 'dayGrid', 'googleCalendar' ],
    googleCalendarApiKey: 'AIzaSyAORiEAqkItdCeiTi77TMxQvMng1xEhoo0',
    events: {
        googleCalendarId: 'newtelco.de_a2nm4ggh259c68lmim5e0mpp8o@group.calendar.google.com'
    }
})

calendar.render()