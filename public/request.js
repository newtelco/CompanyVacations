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

$('#submitBtn').on('click', function() {
    $('#confirmModal').modal('show')
})

$('#modalSubmitBtn').on('click', function() {

    var $form = $('#requestForm')
    allFields = $form.form('get values')
    console.log(allFields)
    console.log(JSON.stringify(allFields))

    fetch('/vacation/submit', {
        method: 'POST',
        body: JSON.stringify(allFields), 
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
    .then(response => response.json())
    .then(data => {
    // console.log(data) 
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
    identifier: 'restUrlaub-vorJahr',
    rules: [
        {
        type   : 'number',
        prompt : 'Please enter vacation days left from last year'
        }
    ]
    },
    jahresUrlaubinsgesamt: {
    identifier: 'jahresUrlaub-insgesamt',
    rules: [
        {
        type   : 'number',
        prompt : 'Please enter the number of vacation days youve earned this year'
        }
    ]
    },
    restjahresUrlaubinsgesamt: {
    identifier: 'restjahresUrlaub-insgesamt',
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
    identifier: 'restUrlaub-left',
    rules: [
        {
        type   : 'number',
        prompt : 'You must agree to the terms and conditions'
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
    identifier: 'managerDropdown',
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