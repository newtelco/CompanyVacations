const url = new URL(window.location.href)
let failedQuery = url.searchParams.get('failed')
if(failedQuery == 1) {
    $('.loginform').addClass('error')
}
const hostname = url.hostname
if(hostname.includes('newtelco.dev')){ 
    $('body').toast({
            title: 'Development Server',
            message: 'You have landed on the development server. Please click this message to go to the production version of the page!',
            class : 'green',
            position: 'bottom center',
            displayTime: 0,
            showIcon: 'exclamation',
            className: {
                toast: 'ui hoverfloating message'
            },
            transition: {
                showMethod   : 'fly right',
                showDuration : 1000,
                hideMethod   : 'fly left',
                hideDuration : 1000
            }, onClick: () => {
                window.location.href = "https://vacation.newtelco.de"
            }
    })
}

const simpleBar = new SimpleBar(document.getElementById('bodyId'), {
autoHide: false
});

const CreateUser = document.querySelector('.loginform')
CreateUser.addEventListener('submit', (e) => {
    e.preventDefault()
    const username = CreateUser.querySelector('.username').value 
    const password = CreateUser.querySelector('.password').value 
    post('/login', { username, password })
}) 

function post(path, data) {
    return window.fetch(path, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(function(res) {
        window.location = res.url
    })
}
