let simpleBar = ''

$(document).ready(() => {
    simpleBar = new SimpleBar(document.getElementById('bodyId'), {
        autoHide: false
    });
})

let table;
let table2;
let user;

fetch('/admin/managers', {
    method: 'POST',
    credentials: 'include',
    headers: new Headers({
        'Content-Type': 'application/json'
    })
})
.then(response => response.json())
.then(data => {

    // console.log(JSON.stringify(data))

    table = new Tabulator("#managerTable", {
        layout: "fitColumns",
        // pagination:"local",
        // paginationSize: 5,
        data: data,
        columns: [
            {title: "ID", field:"id", width: 80},
            {title: "Name", field:"name", editor: "input"},
            {title: "Email", field:"email", editor: "input"},
        ],
        cellEdited:function(cell) {

            editedUser = cell.getRow().getData()

            fetch('/admin/managers/update', {
                method: 'POST',
                body: JSON.stringify(editedUser),
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            })
            .then(response => response.json())
            .then(data => {

                if(data.changedRows > 0) {
                $('body').toast({
                        title: 'Manager Edited',
                        message: 'Successfully edited manager details',
                        class : 'green',
                        position: 'bottom left',
                        displayTime: 5000,
                        className: {
                            toast: 'ui message'
                        }
                    });
                }
            })
            .catch(error => console.error(error))
        }
    });
})
.catch(error => console.error(error))


fetch('/admin/listall', {
    method: 'POST',
    credentials: 'include',
    headers: new Headers({
        'Content-Type': 'application/json'
    })
})
.then(response => response.json())
.then(data => {

    // console.log(JSON.stringify(data))

    table = new Tabulator("#totalVacas", {
        layout: "fitColumns",
        pagination:"local",
        paginationSize: 10,
        data: data,
        initialSort: [
            {column: "submitted_datetime", dir: "desc"}
        ],
        columns: [
            {title: "Name", field:"name"},
            {title: "Days from last year", field:"resturlaubVorjahr"},
            {title: "Days earned this Year", field:"jahresurlaubInsgesamt"},
            {title: "Total Days Available", field:"restjahresurlaubInsgesamt"},
            {title: "Requested", width: 120, field:"beantragt"},
            {title: "Days Leftover", field:"resturlaubJAHR"},
            {title: "From", field:"fromDate", width: 100, formatter:"datetime", formatterParams: {
                    inputFormat: "YYYY-MM-DD",
                    outputFormat: "DD.MM.YYYY",
                    invalidPlaceholder: "invalid date",
                }},
            {title: "To", field:"toDate", width: 100, formatter:"datetime", formatterParams: {
                    inputFormat: "YYYY-MM-DD",
                    outputFormat: "DD.MM.YYYY",
                    invalidPlaceholder: "invalid date",
                }},
            // {title: "Manager", field:"manager"},
            // {title: "Note", field:"note"},
            {title: "Submitted", field:"submitted_datetime", formatter:"datetime", formatterParams: {
                    inputFormat: "YYYY-MM-DD[T]HH:mm:ss[.000Z]",
                    outputFormat: "DD.MM.YYYY HH:MM",
                    invalidPlaceholder: "invalid date",
                }},
            {title: "Approved", field:"approved", width: 100, formatter: function(cell, formatterParams, onRendered) {
                // WAITING ON RESPONSE
                if (cell.getValue() == "0") {
                    return "<i class='approvedIcon fas fa-user-clock'></i>"
                }
                // DENIED
                if (cell.getValue() == "1") {
                    return "<i class='approvedIcon far fa-times-circle'></i>"
                }
                // APPROVED
                if (cell.getValue() == "2") {
                    return "<i class='approvedIcon fa fa-check'></i>"
                }
            },},
            {title: "Approved Date/Time", field: "approval_datetime", formatter:"datetime", formatterParams: {
                    inputFormat: "YYYY-MM-DD[T]HH:mm:ss[.000Z]",
                    outputFormat: "DD.MM.YYYY HH:MM",
                    invalidPlaceholder: "no date",
                }},
        ]
    });

    Tabulator.prototype.extendModule("download", "downloaders", {
        string:function(columns, data, options){
            var fileContents = data.toString();
            return 'data:application/txt;charset=utf-8,' + encodeURIComponent(fileContents);
        }
    });

    // setTimeout(simpleBar.recalculate(), 1000);
    simpleBar.recalculate()

})
.catch(error => console.error(error))

$('.allVacaDLBtn').on('click', () => {
    const user = JSON.parse(window.sessionStorage.getItem('user'))
    const date = moment().format('DDMMYYYY')
    const filename = 'allColleagues_' + date + '_' + 'vacationsExport.xlsx'
    table.download("xlsx", filename, {sheetName:"vacations"}); 
})

$('#userSelectDropdown').dropdown({
    clearable: true,
    fullTextSearch: true,
    allowAdditions: true,
    ignoreDiacritics: true,
    forceSelection: false
});

$('#reportMonthDropdown').dropdown({
    clearable: false,
    allowAdditions: false,
    forceSelection: false
});

$('#reportYearDropdown1').dropdown({
    clearable: false,
    allowAdditions: false,
    forceSelection: false
});

$('#reportYearDropdown2').dropdown({
    clearable: false,
    allowAdditions: false,
    forceSelection: false
});

fetch('/admin/users', {
    method: 'POST',
    credentials: 'include',
    headers: new Headers({
        'Content-Type': 'application/json'
    })
})
.then(response => response.json())
.then(data => {
    // console.log(JSON.stringify(data))
    for(i = 0; i < data.length; i++) {
        value = data[i].email
        name = data[i].name
        value = value.substring(0, value.lastIndexOf("@"));

        $('#userSelectMenu').append('<div class="item" data-text="'+ value + '">' + name + '</div>')
    }

})
.catch(error => console.error(error))

$('#userSelectDropdown').dropdown({
    onChange: function() {

        if($('#userVacasPlaceholder').css('visible', true)) {
            $('#userVacasPlaceholder').hide()
        }

        let name = $('#userSelectDropdown').dropdown('get value')
        // let name = email.substring(0, email.lastIndexOf("@"));
        name = { username: name }

        fetch('/vacation/list', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(name),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })
        .then(response => response.json())
        .then(data => {

            // console.log(JSON.stringify(data))

            table2 = new Tabulator("#userVacas", {
                layout: "fitColumns",
                data: data,
                pagination:"local",
                paginationSize: 6,
                initialSort: [
                    {column: "submitted_datetime", dir: "desc"}
                ],
                columns: [
                    {title: "Days from last year", field:"resturlaubVorjahr"},
                    {title: "Days earned this Year", field:"jahresurlaubInsgesamt"},
                    {title: "Total Days Available", field:"restjahresurlaubInsgesamt"},
                    {title: "Requested", width: 120, field:"beantragt"},
                    {title: "Days Leftover", field:"resturlaubJAHR"},
                    {title: "From", field:"fromDate", width: 100, formatter:"datetime", formatterParams: {
                            inputFormat: "YYYY-MM-DD",
                            outputFormat: "DD.MM.YYYY",
                            invalidPlaceholder: "invalid date",
                        }},
                    {title: "To", field:"toDate", width: 100, formatter:"datetime", formatterParams: {
                            inputFormat: "YYYY-MM-DD",
                            outputFormat: "DD.MM.YYYY",
                            invalidPlaceholder: "invalid date",
                        }},
                    // {title: "Manager", field:"manager"},
                    // {title: "Note", field:"note"},
                    {title: "Submitted", field:"submitted_datetime", formatter:"datetime", formatterParams: {
                            inputFormat: "YYYY-MM-DD[T]HH:mm:ss[.000Z]",
                            outputFormat: "DD.MM.YYYY HH:MM",
                            invalidPlaceholder: "invalid date",
                        }},
                    {title: "Approved", field:"approved", width: 100, formatter: function(cell, formatterParams, onRendered) {
                        // WAITING ON RESPONSE
                        if (cell.getValue() == "0") {
                            return "<i class='approvedIcon fas fa-user-clock'></i>"
                        }
                        // DENIED
                        if (cell.getValue() == "1") {
                            return "<i class='approvedIcon far fa-times-circle'></i>"
                        }
                        // APPROVED
                        if (cell.getValue() == "2") {
                            return "<i class='approvedIcon fa fa-check'></i>"
                        }
                    },}
                ]
            });
            Tabulator.prototype.extendModule("download", "downloaders", {
                string:function(columns, data, options){
                    var fileContents = data.toString();
                    return 'data:application/txt;charset=utf-8,' + encodeURIComponent(fileContents);
                }
            });
        })
        .catch(error => console.error(error))
    }
});

$('.userVacaDLBtn').on('click', () => {
    let name = $('#userSelectDropdown').dropdown('get value')
    // let name = email.substring(0, email.lastIndexOf("@"));
    const date = moment().format('DDMMYYYY')
    const filename = name + '_' + date + '_' + 'vacationsExport.xlsx'
    table2.download("xlsx", filename, {sheetName:"vacations"}); 
})