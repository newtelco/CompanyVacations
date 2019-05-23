/**
 * @summary NewTelco GmbH Vacation Application
 * @author Nico Domino <yo@ni.co.de>
 * @license AGPLv3
 */

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

fetch('/report/allVacations', {
    method: 'POST',
    credentials: 'include',
    headers: new Headers({
        'Content-Type': 'application/json'
    })
})
.then(response => response.json())
.then(data1 => {
    //  console.log(JSON.stringify(data1))

    const userMail = user.mail
    const userMailObj = {
        userMail: userMail
    }

    fetch('/report/myVacations', {
        method: 'POST',
        body: JSON.stringify(userMailObj),
        credentials: 'include',
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
    .then(response => response.json())
    .then(data => {
        // console.log(JSON.stringify(data))

        // ALL VACAS
        let monthCount = []
        let monthLabel = []
        data1.forEach(m => { monthCount.push(m.COUNT) })
        data1.forEach(m => { monthLabel.push(m.MONTH) })

        firstMonth = monthLabel[0]
        lastMonth = monthLabel[7]

        monthCount.push(0)
        monthCount.splice(0,0,0)
        monthLabel.push('NULL')
        monthLabel.splice(0,0,'NULL')

        // MY VACAS
        console.log(data1)
        console.log(data)
        let userMonthCount = []
        
        data.forEach(n => { userMonthCount.push(n.MONTH) })
        data.forEach(n => { userMonthCount.push(n.COUNT) })
        
        userMonthCount.push(0)
        userMonthCount.splice(0,0,0)

        console.log(userMonthCount)

        let maxCount = monthCount.reduce(function(a, b) {
            return Math.max(a, b);
        });
        maxCount = maxCount + (maxCount / 10)

        let ctx = document.getElementById('mixedChart');
        var mixedChart = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: [{
                    label: 'My Vacations',
                    data: userMonthCount,
                    backgroundColor: 'rgb(239, 105, 185, 0.6)',
                    borderColor: 'rgb(239, 105, 185)',
                    borderWidth: 2,
                    barPercentage: 0.2
                }, {
                    label: 'Company Vacations',
                    data: monthCount,
                    type: 'line',
                    backgroundColor: 'rgb(103, 178, 70, 0.3)',
                    borderColor: 'rgb(103, 178, 70)',
                    borderWidth: 2,
                    spanGaps: true
                }],
                labels: monthLabel
            },
            options: {
                responsive: true,
                legend: {
                    display: false
                },
                tooltips: {
                    mode: 'x'
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            suggestedMax: maxCount
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            min: firstMonth,
                            max: lastMonth
                        }
                    }]
                }
            }
        });

        var randomScalingFactor = function() {
			return Math.round(Math.random() * 100);
        };
        
        // console.log(table)
        const data2 = table.getData()
        // console.log(data2)
        let dataLength = data2.length
        dataLength--
        // console.log(dataLength)
        const lastRow = data2[dataLength]
        console.log(lastRow)
        const daysAvailable = lastRow.restjahresurlaubInsgesamt 
        const daysRemaining = lastRow.resturlaubJAHR


        let ctx2 = document.getElementById('donutChart');
        var donutChart = new Chart(ctx2, {
			type: 'doughnut',
			data: {
				datasets: [{
					data: [
                        daysRemaining,
                        daysAvailable
					],
					backgroundColor: [
                        'rgba(244,0,0,0.6)',
                        'rgba(0,0,0,0.5)'
					],
					label: 'Dataset 1'
				}],
				labels: [
					'Remaining',
					'Available'
				]
			},
			options: {
				responsive: true,
				legend: {
                    display: false
				},
				title: {
					display: false,
				},
				animation: {
					animateScale: true,
					animateRotate: true
                },
                layout: {
                    padding: {
                        left: 20,
                        right: 20,
                        top: 20,
                        bottom: 20
                    }
                },
                circumference: Math.PI,
                rotation: -Math.PI 
			}
		})

    })
    .catch(error => console.error(error))
})
.catch(error => console.error(error))

$(window).on('load', function() {
  var win = $(this);
//   console.log(`width: ${win.width()}`)
  if (win.width() < 1000) {

  }
})