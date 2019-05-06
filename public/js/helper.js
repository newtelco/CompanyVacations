user = window.sessionStorage.getItem('user')
user = JSON.parse(user)

$('#adminLink').hide()
$('#adminDivider').hide()

for(i = 0; i < user.memberOf.length; i++) {
    if(user.memberOf[i].includes('AdminGroup') || user.memberOf[i].includes('Management')) {
        $('#adminLink').show()
        $('#adminDivider').show()
    }
}