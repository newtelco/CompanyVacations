/**
 * @summary Company Vacation Application
 * @author Nico Domino <yo@ni.co.de>
 * @license AGPLv3
 */

$('#adminLink').hide()
$('#adminDivider').hide()

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
        $('#adminLink').hide()
        $('#adminDivider').hide()
        for(i = 0; i < data.memberOf.length; i++) {
            if(data.memberOf[i].includes('AdminGroup') || data.memberOf[i].includes('Management')) {
                $('#adminLink').show()
                $('#adminDivider').show()
            }
        }
        if(verb == 'set') {
            window.sessionStorage.setItem('user',JSON.stringify(data))
            return data
        } else if (verb == 'get') {
            return data.sAMAccountName
        }

        for(i = 0; i < user.memberOf.length; i++) {
            if(user.memberOf[i].includes('AdminGroup') || user.memberOf[i].includes('Management')) {
                $('#adminLink').show()
                $('#adminDivider').show()
            }
        }
    })
    .catch(error => console.error(error))
}

// check sessionStorage - if another user is saved there
// already, then compare and save new User
if(window.sessionStorage.getItem('user') === null) {
    user = UserInfo('set')    
} else {
    user = window.sessionStorage.getItem('user')
    user = JSON.parse(user)
    savedUser = UserInfo('get')
    if(user.sAMAccountName != savedUser) {
        UserInfo('set')
    }
}


