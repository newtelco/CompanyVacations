
// document.addEventListener("DOMContentLoaded", function() {
//     // OverlayScrollbars(document.querySelectorAll('body'), {
//     //     //className: "os-theme-thin-dark",
//     //     overflowBehavior: {
//     //         x : "hidden"
//     //     }
//     // });
//     const ps = new PerfectScrollbar('body')
// });

// const ps = new PerfectScrollbar('#bodyDiv')

const simpleBar = new SimpleBar(document.getElementById('bodyId'), {
    autoHide: false
});


$('#managerDropdown').dropdown({
    clearable: false,
    fullTextSearch: true,
    allowAdditions: true,
    ignoreDiacritics: true,
    forceSelection: true
  });

$('#fromCalendar').calendar({
    type: 'date'
  });

$('#toCalendar').calendar({
    type: 'date'
  });

$('#submitBtn').on('click', function(e) {
    e.preventDefault()
    $('#confirmModal').modal('show')
})

$('#modalSubmitBtn').on('click', function() {

    var $form = $('#requestForm')
    allFields = $form.form('get values')
   // console.log(allFields)
    // console.log(JSON.stringify(allFields))

    fetch('/vacation/submit', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(allFields), 
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(JSON.stringify(data))

        $('body').toast({
                title: 'Vacation Requested!',
                message: 'Successfully requested vacation. You will be notified as soon as your manager responds.',
                class : 'green',
                position: 'bottom right',
                displayTime: 5000,
                className: {
                    toast: 'ui message'
                }
            });
    })
    .catch(error => console.error(error))
})

$('#modalCancelBtn').on('click', function() {
    $('#confirmModal').modal('hide')
})

$('.ui.form')
.form({
fields: {
    name: {
    identifier: 'name',
    rules: [
        {
        type   : 'empty',
        prompt : 'Please enter your name'
        }
    ]
    },
    email: {
    identifier: 'email',
    rules: [
        {
        type   : 'email',
        prompt : 'Please enter a valid email address'
        }
    ]
    },
    restUrlaubvorJahr: {
    identifier: 'resturlaubVorjahr',
    rules: [
        {
        type   : 'number',
        prompt : 'Please enter vacation days left from last year'
        }
    ]
    },
    jahresUrlaubinsgesamt: {
    identifier: 'jahresurlaubInsgesamt',
    rules: [
        {
        type   : 'number',
        prompt : 'Please enter the number of vacation days youve earned this year'
        }
    ]
    },
    restjahresUrlaubinsgesamt: {
    identifier: 'restjahresurlaubInsgesamt',
    rules: [
        {
        type   : 'number',
        prompt : 'Please enter days available this year (Left over from last year + gained this year).'
        }
    ]
    },
    beantragt: {
    identifier: 'beantragt',
    rules: [
        {
        type   : 'number',
        prompt : 'Please enter the amount of days requested.'
        }
    ]
    },
    restUrlaubleft: {
    identifier: 'resturlaubJAHR',
    rules: [
        {
        type   : 'number',
        prompt : 'Please enter the number of days now left for this year.'
        }
    ]
    },
    fromDate: {
    identifier: 'fromDate',
    rules: [
        {
        type   : 'empty',
        prompt : 'Please enter date you want vacation FROM.'
        }
    ]
    },
    toDate: {
    identifier: 'toDate',
    rules: [
        {
        type   : 'empty',
        prompt : 'Please enter date you want vacation TO.'
        }
    ]
    },
    manager: {
    identifier: 'manager',
    rules: [
        {
        type   : 'exactCount[1]',
        prompt : 'You must select a manager to approve your vacation request.'
        }
    ]
    }
}
});

$('#clearBtn').on('click', function() {
    $('#requestForm').form('clear');
});

/* 
 * Get Form Values - https://fomantic-ui.com/behaviors/form.html
 *
 * var $form = $('#requestForm');
 * allFields = $form.form('get values');
 * console.log(allFields); 
 * 
 */