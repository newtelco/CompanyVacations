/**
 * @summary NewTelco GmbH Vacation Application
 * @author Nico Domino <yo@ni.co.de>
 * @license AGPLv3
 */

let simpleBar = ''
 
$(document).ready(() => {
    simpleBar = new SimpleBar(document.getElementById('bodyId'), {
        autoHide: false
    });
    $('body').toast({
        title: 'Keyboard Shortcuts',
        message: 'To view the available keyboard shortcuts, press <br><b>Shift + Q</b>.',
        class : 'green',
        position: 'bottom right',
        showIcon: 'keyboard outline',
        displayTime: 7000,
        className: {
            toast: 'ui message'
        },
        transition: {
            showMethod   : 'fly right',
            showDuration : 1000,
            hideMethod   : 'fly left',
            hideDuration : 1000
        }
    });
})

let table;
let table2;

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

    table5 = new Tabulator("#managerTable", {
        layout: "fitColumns",
        data: data,
        columns: [
            {title: "ID", field:"id", align: 'center', headerSort:false, width: 50},
            {title: "Name", field:"name", editor: "input"},
            {title: "Email", field:"email", editor: "input"},
            {title: 'Delete', align: 'center', width: 70, headerSort:false, formatter:'buttonCross', cellClick: function(e, cell) {
                $('.ui.basic.modal.confirmDeleteManager')
                .modal({ onApprove: () => {
                    cell.getRow().delete();
                    let cellData = cell.getRow().getData();
                    fetch('/admin/managers/delete', {
                        method: 'POST',
                        credentials: 'include',
                        body: JSON.stringify(cellData),
                        headers: new Headers({
                            'Content-Type': 'application/json'
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        // console.log(JSON.stringify(data))
                        if(data.affectedRows > 0) {
                            $('body').toast({
                                title: 'Manager Deleted',
                                message: 'Successfully deleted manager.',
                                class : 'green',
                                position: 'bottom left',
                                showIcon: 'trash alternate outline',
                                displayTime: 5000,
                                className: {
                                    toast: 'ui message'
                                },
                                transition: {
                                    showMethod   : 'fly right',
                                    showDuration : 1000,
                                    hideMethod   : 'fly left',
                                    hideDuration : 1000
                                }
                            });
                        }
                        
                    })
                    .catch(error => console.error(error))
                }})
                .modal('show')
            }},
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

                if(data.affectedRows > 0) {
                    $('body').toast({
                        title: 'Manager Edited',
                        message: 'Successfully edited manager details',
                        class : 'green',
                        showIcon: 'user edit',
                        position: 'bottom left',
                        displayTime: 5000,
                        className: {
                            toast: 'ui message'
                        },
                        transition: {
                            showMethod   : 'fly right',
                            showDuration : 1000,
                            hideMethod   : 'fly left',
                            hideDuration : 1000
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
    let approvedenyMutator = function(value, data, type, params, component) {

        let user = JSON.parse(window.sessionStorage.getItem('user'))
        user = user.sAMAccountName
        let manager = data.manager
        manager = manager.substring(0, manager.lastIndexOf("@"));
        let approvalhash = data.approval_hash
        let approved = data.approved
        let hostname = window.location.hostname

        if(manager == user && approved == 0) {
            return '<a class="approveBtn" target"_blank" href="https://'+hostname+'/admin/response?h='+approvalhash+'&a=a"><i style="font-size: 22px; margin-right: 5px; color: #67B236;" class="fas fa-check"></i></a><a class="denyBtn" target="_blank" href="https://'+hostname+'/admin/response?h='+approvalhash+'&a=d"><i style="font-size: 22px; color: #ff7272" class="fas fa-ban"></i></a>'
        } else if (manager == user && approved != 0) {
            return 'Done'
        // } else if (manager != user) {
        //     return '<small>Submitted to someone else</small>'
        } else if (user == 'nhartmann' && approved == 0) {
            return '<a class="approveBtn" target"_blank" href="https://'+hostname+'/admin/response?h='+approvalhash+'&a=a"><i style="font-size: 22px; margin-right: 5px; color: #67B236;" class="fas fa-check"></i></a><a class="denyBtn" target="_blank" href="https://'+hostname+'/admin/response?h='+approvalhash+'&a=d"><i style="font-size: 22px; color: #ff7272" class="fas fa-ban"></i></a>'
        }
    }

    table = new Tabulator("#totalVacas", {
        layout: "fitColumns",
        pagination:"local",
        paginationSize: 10,
        selectable: true,
        data: data,
        initialSort: [
            {column: "submitted_datetime", dir: "desc"}
        ],
        columns: [
            {title: "id", field: "id", visible: false},
            {title: "Name", headerSort: false, field:"name"},
            {title: "Days from last year", headerSort: false,field:"resturlaubVorjahr"},
            {title: "Days earned this Year", headerSort: false, field:"jahresurlaubInsgesamt"},
            {title: "Total Days Available", headerSort: false,  field:"restjahresurlaubInsgesamt"},
            {title: "Requested", width: 100, headerSort: false, field:"beantragt"},
            {title: "Days Leftover", headerSort: false, field:"resturlaubJAHR"},
            {title: "From", field:"fromDate", width: 100, formatter:function(cell, formatterParams, onRendered) {
                let cellVal = cell.getValue()
                let newDate = moment.utc(cellVal).local().format('DD.MM.YYYY')
                return newDate
            }},
            {title: "To", field:"toDate", width: 100, formatter:function(cell, formatterParams, onRendered) {
                let cellVal = cell.getValue()
                let newDate = moment.utc(cellVal).local().format('DD.MM.YYYY')
                return newDate
            }},
            {title: "Submitted", field:"submitted_datetime", formatter:function(cell, formatterParams, onRendered) {
                let cellVal = cell.getValue()
                let newDate = moment.utc(cellVal).local().format('DD.MM.YYYY HH:mm')
                return newDate
            }},
            {title: "Approval Hash", field:"approval_hash", visible: false},
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
            }},
            {title: "Approved Date/Time", field: "approval_datetime", formatter:function(cell, formatterParams, onRendered) {
                let cellVal = cell.getValue()
                if(cellVal == null) {
                    return 'N/A'
                } else {
                    let newDate = moment.utc(cellVal).local().format('DD.MM.YYYY HH:mm')
                    return newDate
                }
            }},
            {title: 'Manager', width: 100, headerSort: false, field: 'manager', formatter: function(cell) {
                let email = cell.getValue()
                let username = email.substring(0, email.lastIndexOf("@"))
                return username
            }},
            {title: 'Approve/Deny', field: 'approvedeny', headerSort: false, width: 80, align: 'center', formatter:"html", mutator: approvedenyMutator}, 

        ]
    });

    Tabulator.prototype.extendModule("download", "downloaders", {
        string:function(columns, data, options){
            var fileContents = data.toString();
            return 'data:application/txt;charset=utf-8,' + encodeURIComponent(fileContents);
        }
    });

    // setTimeout(simpleBar.recalculate(), 1000);
    // simpleBar.recalculate()

    hotkeys('shift+q', (event, handler) =>{
      event.preventDefault()
      $('.keyboardShortcuts').modal('toggle')
    })

    hotkeys('shift+l', (event, handler) =>{
        let selectedData = table.getSelectedData()
        let selectedVacations = []
        selectedData.forEach((el) => {
            let fromDate = moment(el.fromDate).local().format('DD.MM.YYYY')
            let toDate = moment(el.toDate).local().format('DD.MM.YYYY')

            selectedVacations.push([el.name, fromDate, toDate, el.id])
        })
        
        let delModalContent = []
        if($('#delModalVacaText').length) {
            $('#delModalVacaText').remove()
        }
        delModalContent.push('<div id="delModalVacaText">')
        selectedVacations.forEach((el) => {
            delModalContent.push('<br><b>' + el[0] + '</b> - From: <b>' + el[1]+ '</b> To: <b>' + el[2] + '</b>')
        })
        delModalContent.push('</div>')
        $('#delModalContent').append(delModalContent.join(''))
        $('.delVacaModal').modal({onApprove: () => {

            let delIds = []
            selectedVacations.forEach((el) => {
                delIds.push(el[3])
            })
            fetch('/admin/vacations/delete', {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify(delIds),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            })
            .then(response => response.json())
            .then(data => {
                // console.log(JSON.stringify(data))
                if(data.affectedRows > 0) {
                    // delete row from current table view
                    delIds.forEach((el) => {
                        var delRow = table.searchRows("id", "=", el)
                        table.deleteRow(delRow[0])
                    })
                    $('body').toast({
                        title: 'Vacation(s) Deleted',
                        message: 'Successfully deleted vacation(s).',
                        class : 'green',
                        position: 'bottom left',
                        showIcon: 'trash alternate outline',
                        displayTime: 5000,
                        className: {
                            toast: 'ui message'
                        },
                        transition: {
                            showMethod   : 'fly right',
                            showDuration : 1000,
                            hideMethod   : 'fly left',
                            hideDuration : 1000
                        }
                    });
                }
                
            })
            .catch(error => console.error(error))
        }}).modal('show')
    })
})
.catch(error => console.error(error))

// download xlsx from the AllVaca table
$('.allVacaDLBtn').on('click', () => {
    const user = JSON.parse(window.sessionStorage.getItem('user'))
    const date = moment().format('DDMMYYYY')
    const filename = 'allColleagues_' + date + '_' + 'vacationsExport.xlsx'
    table.download("xlsx", filename, {sheetName:"vacations"}); 
})

// Dynamically fill the year dropdown
const yearNow = moment().format('YYYY')
$('#reportYearDropdown2').append('<option value="' + yearNow + '">' + yearNow + '</option>')
$('#reportYearDropdown2').append('<option value="' + (yearNow-1) + '">' + (yearNow-1) + '</option>')
$('#reportYearDropdown2').append('<option value="' + (yearNow-2) + '">' + (yearNow-2) + '</option>')

$('#reportMonthDropdown2').append('<option value="' + yearNow + '">' + yearNow + '</option>')
$('#reportMonthDropdown2').append('<option value="' + (yearNow-1) + '">' + (yearNow-1) + '</option>')
$('#reportMonthDropdown2').append('<option value="' + (yearNow-2) + '">' + (yearNow-2) + '</option>')


// button click - monthly download
$('#dlMonthlyBtn').on('click', () => {
    let targetMonth = $('#reportMonthDropdown option:selected').val()
    let targetYear = $('#reportMonthDropdown2 option:selected').val()

    targetDate = { 
        month: targetMonth,
        year: targetYear
     }

    fetch('/report/month', {
        method: 'POST',
        body: JSON.stringify(targetDate),
        credentials: 'include',
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
    .then(response => response.json())
    .then(data => {
        // console.log(JSON.stringify(data))

        if(JSON.stringify(data) == "[]") {
            $('body').toast({
                title: 'No Data!',
                message: 'No results for that month and year combination.',
                class : 'green',
                showIcon: 'database',
                position: 'bottom left',
                displayTime: 5000,
                className: {
                    toast: 'ui message'
                },
                transition: {
                    showMethod   : 'fly right',
                    showDuration : 1000,
                    hideMethod   : 'fly left',
                    hideDuration : 1000
                }
            });
            return false
        }

        dateAccessor = function(value, data, type, params, column){
            let newDate = moment.utc(value).local().format('DD.MM.YYYY')
            return newDate
        }

        dateTimeAccessor = function(value, data, type, params, column){
            let newDate = moment.utc(value).local().format('DD.MM.YYYY HH:mm')
            return newDate
        }

        approveAccessor = function(value, data, type, params, column){
            let approvedText = ''
            switch(value) {
                case 0:
                    approvedText = "Waiting"
                case 1:
                    approvedText = "Denied"
                case 2:
                    approvedText = "Approved"
            }
            return approvedText
        }
        
        table4 = new Tabulator("#exportTable", {
            layout: "fitColumns",
            data: data,
            pagination:"local",
            paginationSize: 6,
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
                {title: "From", field:"fromDate", width: 100, accessorDownload:dateAccessor},
                {title: "To", field:"toDate", width: 100, accessorDownload:dateAccessor},
                {title: "Note", field:"note"},
                {title: "Submitted", field:"submitted_datetime", accessorDownload:dateTimeAccessor},
                {title: "Manager", field:"manager"},
                {title: "Approved", field:"approved", accessorDownload:approveAccessor},
                {title: "Approved Date/Time", field: "approval_datetime", accessorDownload:dateTimeAccessor},
            ],
        });

        Tabulator.prototype.extendModule("download", "downloaders", {
            string:function(columns, data, options){
                var fileContents = data.toString();
                return 'data:application/txt;charset=utf-8,' + encodeURIComponent(fileContents);
            }
        });

        const filename = targetMonth + targetYear + '_' + 'vacationsExport.xlsx'
        table4.download("xlsx", filename, {sheetName:"vacations"}); 
    })
    .catch(error => console.error(error))
})

// button click - yearly download
$('#dlYearlyBtn').on('click', () => {

    let targetYear = $('#reportYearDropdown2 option:selected').val()

    targetDate = { 
        year: targetYear
     }

    fetch('/report/year', {
        method: 'POST',
        body: JSON.stringify(targetDate),
        credentials: 'include',
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
    .then(response => response.json())
    .then(data => {
        // console.log(JSON.stringify(data))

        if(JSON.stringify(data) == "[]") {
            $('body').toast({
                title: 'No Data!',
                message: 'There was no data for that year available.',
                class : 'green',
                showIcon: 'database',
                position: 'bottom left',
                displayTime: 5000,
                className: {
                    toast: 'ui message'
                },
                transition: {
                    showMethod   : 'fly right',
                    showDuration : 1000,
                    hideMethod   : 'fly left',
                    hideDuration : 1000
                }
            });
            return false
        }

        dateAccessor = function(value, data, type, params, column){
            let newDate = moment.utc(value).local().format('DD.MM.YYYY')
            return newDate
        }

        dateTimeAccessor = function(value, data, type, params, column){
            let newDate = moment.utc(value).local().format('DD.MM.YYYY HH:mm')
            return newDate
        }

        approveAccessor = function(value, data, type, params, column){
            let approvedText = ''
            switch(value) {
                case 0:
                    approvedText = "Waiting"
                case 1:
                    approvedText = "Denied"
                case 2:
                    approvedText = "Approved"
            }
            return approvedText
        }
        
        table4 = new Tabulator("#exportTable", {
            layout: "fitColumns",
            data: data,
            pagination:"local",
            paginationSize: 6,
            initialSort: [
                {column: "submitted_datetime", dir: "desc"}
            ],
            columns: [
                {title: "Name", field:"name"},
                {title: "Days from last year", field:"resturlaubVorjahr"},
                {title: "Days earned this Year", field:"jahresurlaubInsgesamt"},
                {title: "Total Days Available", field:"restjahresurlaubInsgesamt"},
                {title: "Requested", field:"beantragt"},
                {title: "Days Leftover", field:"resturlaubJAHR"},
                {title: "From", field:"fromDate", accessor: dateAccessor},
                {title: "To", field:"toDate", accessorDownload: dateAccessor},
                {title: "Note", field:"note"},
                {title: "Submitted", field:"submitted_datetime", accessorDownload: dateTimeAccessor},
                {title: "Manager", field:"manager"},
                {title: "Approved", field:"approved", accessorDownload: approveAccessor},
                {title: "Approved Date/Time", field: "approval_datetime", accessorDownload: dateTimeAccessor}
            ]
        });

        Tabulator.prototype.extendModule("download", "downloaders", {
            string:function(columns, data, options){
                var fileContents = data.toString();
                return 'data:application/txt;charset=utf-8,' + encodeURIComponent(fileContents);
            }
        });

        const filename = targetYear + '_' + 'vacationsExport.xlsx'
        table4.download("xlsx", filename, {sheetName:"vacations"}); 
    })
    .catch(error => console.error(error))
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

$('#reportMonthDropdown2').dropdown({
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
                    }},
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

$('#addManagerBtn').on('click', () => {
    $('.ui.modal.addManager')
    .modal('show');
})

$('#addManagerSubmitBtn').on('click', () => {

    let managerForm = $('.ui.form.addManager').form('get values')

        fetch('/admin/managers/add', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(managerForm),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })
        .then(response => response.json())
        .then(data => {
            // console.log(JSON.stringify(data))
            $('body').toast({
                title: 'Manager Added',
                message: 'Successfully added manager.',
                class : 'green',
                showIcon: 'plus',
                position: 'bottom left',
                displayTime: 5000,
                className: {
                    toast: 'ui message'
                },
                transition: {
                    showMethod   : 'fly right',
                    showDuration : 1000,
                    hideMethod   : 'fly left',
                    hideDuration : 1000
                }
            });
            const id = data.insertId
            const name = managerForm.name
            const email = managerForm.email
            table5.addData([{id:id, name:name, email:email}], false);
        })
        .catch(error => console.error(error))
})

// lazy javascript way because CSS was not doing what I wanted
let shortCutsTable = document.getElementById('shortcutsTable')
let descendents = shortCutsTable.getElementsByTagName('*')

descendents.forEach((el) => {
    el.setAttribute('style','color: #fff !important')
})


