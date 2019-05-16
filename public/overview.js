var table;
var user;

function getDates(startDate, stopDate) {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
        dateArray.push( moment(currentDate).format('YYYY-MM-DD') )
        currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
}

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
            {title: "Remaining days - last year", field:"resturlaubVorjahr"},
            {title: "Remaining days - this year", field:"jahresurlaubInsgesamt"},
            {title: "Total Days Available", field:"restjahresurlaubInsgesamt"},
            {title: "Requested", width: 120, field:"beantragt"},
            {title: "Total Days Remaining", field:"resturlaubJAHR"},
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


let targetYear = new Date()
targetYear = targetYear.getFullYear()
targetYear = {
    year: targetYear
}

fetch('/report/year', {
    method: 'POST',
    body: JSON.stringify(targetYear),
    credentials: 'include',
    headers: new Headers({
        'Content-Type': 'application/json'
    })
})
.then(response => response.json())
.then(data => {
    /* console.log(JSON.stringify(data))
   
    {
        "id":8,
        "name":"Stylianos Stergiou",
        "email":"sstergiou@newtelco.de",
        "resturlaubVorjahr":3,
        "jahresurlaubInsgesamt":26,
        "restjahresurlaubInsgesamt":29,
        "beantragt":5,
        "resturlaubJAHR":24,
        "fromDate":"2019-01-07T23:00:00.000Z",
        "toDate":"2019-01-13T23:00:00.000Z",
        "manager":"nhartmann@newtelco.de",
        "note":null,
        "submitted_datetime":"2018-10-18T15:21:16.000Z",
        "submitted_by":"sstergiou",
        "approval_hash":null,
        "approved":2,
        "approval_datetime":null
    }

    */

    let currentUserRows = ''
    let sumDates = []

    data.forEach(vaca => {
        from = vaca.fromDate
        to = vaca.toDate
        diffDates = getDates(from, to)
        sumDates.push(diffDates)
        console.log(diffDates)
    })

    console.log(sumDates)

    let flatDates = [].concat.apply([], sumDates)
    console.log(flatDates)

    let ctx = document.getElementById('myChart');
    var mixedChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: [{
                label: 'Bar Dataset',
                data: [10, 20, 30, 40]
            }, {
                label: 'Line Dataset',
                data: [50, 50, 50, 50],

                // Changes this dataset to become a line
                type: 'line'
            }],
            labels: ['January', 'February', 'March', 'April']
        },
        options: {
            responsive: true,
            title:      {
                display: true,
                text:    "Chart.js Time Scale"
            },
            scales:     {
                xAxes: [{
                    type:       "time",
                    time:       {
                        // format: timeFormat,
                        tooltipFormat: 'll'
                    },
                    scaleLabel: {
                        display:     true,
                        labelString: 'Date'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display:     true,
                        labelString: 'value'
                    }
                }]
            }
        }
    });
})
.catch(error => console.error(error))
