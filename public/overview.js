var table;
var user;

fetch('/vacation/list', {
    method: 'POST',
    credentials: 'include',
    headers: new Headers({
        'Content-Type': 'application/json'
    })
})
.then(response => response.json())
.then(data => {

    // console.log(JSON.stringify(data))

    table = new Tabulator("#vacationsTable", {
        layout: "fitColumns",
        // persistenceMode: "cookie",
        // persistentLayout: true,
        data: data,
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

$('.dlBtn').on('click', () => {
    const user = JSON.parse(window.sessionStorage.getItem('user'))
    const date = moment().format('DDMMYYYY')
    const filename = user.sAMAccountName + '_' + date + '_' + 'vacationsExport.xlsx'
    table.download("xlsx", filename, {sheetName:"vacations"}); 
})