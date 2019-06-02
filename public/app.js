/**
 * @summary NewTelco GmbH Vacation Application
 * @author Nico Domino <yo@ni.co.de>
 * @license AGPLv3
 */

const url = new URL(window.location.href)
let failedQuery = url.searchParams.get('failed')
if(failedQuery == 1) {
    $('.loginform').addClass('error')
}
let responseQuery = url.searchParams.get('response')
if(responseQuery == 2) {
    $('body').toast({
            title: 'Please Login!',
            message: 'You must login to approve or deny a vacation request',
            class : 'green',
            position: 'bottom center',
            displayTime: 6000,
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

const loginForm = document.querySelector('.loginform')
loginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const username = loginForm.querySelector('.username').value 
    const password = loginForm.querySelector('.password').value 
    post('/login', { username, password })
}) 

function post(path, data) {
    console.log(data)
    return window.fetch(path, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(function(res) {
        const reqURL = new URL(res.url)
        if(reqURL.pathname.includes("/admin/response")) {
            if (res.status = 200) {
                window.location = "/responseSuccess.html"
            } else {
                window.location = "/responseError.html"
            }
        } else {
            window.location = res.url
        }
    })
}
