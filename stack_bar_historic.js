function newPlot(divID, level, consumption, dates) {
    level = level.map(v => {
        return v / 100
    })
    consumption = consumption.map(v => {
        return v / 100
    })
    var levelTrace = {
        y: level,
        x: dates,
        name: 'Nível',
        type: 'bar',
        marker: {
            color: "#F47373"
        }
    };

    var consumptionTrace = {
        y: consumption,
        x: dates,
        name: 'Consumo',
        type: 'bar',
        marker: {
            color: "#2CCCE4"
        }
    };

    var data = [levelTrace, consumptionTrace];

    var layout = {
        barmode: 'overlay',
        xaxis: {
        },
        yaxis: {
            tickformat: "0,.1%",
            range: [0, 1]
        },
        margin: {
            b: 40,
            t: 40,
        }
    };
    var config = {
        responsive: true,
        displayModeBar: false,
    };


    var d3 = Plotly.d3;
    var WIDTH_IN_PERCENT_OF_PARENT = 100,
        HEIGHT_IN_PERCENT_OF_PARENT = 100;

    var gd3 = d3
        .select('#'+divID)
        .style({
            width: WIDTH_IN_PERCENT_OF_PARENT + '%',
            'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',
            height: HEIGHT_IN_PERCENT_OF_PARENT + 'vh',           
        });

    var gd = gd3.node();
    Plotly.newPlot(gd, data, layout, config);
    window.onresize = function () {
        Plotly.Plots.resize(gd);
    };

}

function getLastVariableValue(variable, token, size, callback) {
    var url = 'https://industrial.api.ubidots.com/api/v1.6/variables/' + variable + '/values/?page_size=' + size;
    var headers = {
        'X-Auth-Token': token,
        'Content-Type': 'application/json'
    };

    return new Promise(resolve => {
        $.ajax({
            url: url,
            method: 'GET',
            headers: headers,
            success: function (res) {
                // callback(res.results)
                resolve(res.results)
            }
        });
    })
}

function getLastVariableValueOnTimestamp(variable, token, endTS, callback) {
    var url = 'https://industrial.api.ubidots.com/api/v1.6/variables/' + variable + '/values/?page_size=1&end=' + endTS;
    var headers = {
        'X-Auth-Token': token,
        'Content-Type': 'application/json'
    };


    return new Promise(resolve => {
        $.ajax({
            url: url,
            method: 'GET',
            headers: headers,
            success: function (res) {                
                resolve(res.results)
            }
        });
    })

}


function exec() {
    var daysLookupPast = 5
    var dates = []
    var consumptions = []
    var levels = Array(daysLookupPast)
    var pushCnt = 0
    getLastVariableValue("6153304cc7b3e92dafe4c234", TOKEN, daysLookupPast + 1, () => { }).then(r => {
        return new Promise(resolve => {
            r = r.slice(1)
            for (let i in r) {                
                var date = new Date(r[i].timestamp)
                var d = date.getDate().toString().padStart(2, '0')
                var m = date.getMonth().toString().padStart(2, '0')
                var y = date.getFullYear().toString().slice(-2)
                let fDate = `${d}/${m}/${y}`
                dates.push(fDate)
                consumptions.push(r[i].value)
                getLastVariableValueOnTimestamp("61526f7edb1d5a0049862ae1", TOKEN, r[i].timestamp + (24 * 3e6), () => { }).then(r2 => {                                        
                    levels[i] = r2[0].value
                    pushCnt++
                    if (pushCnt == daysLookupPast) {
                        resolve()
                    }
                })
            }
        })
    }).then(() => {
        newPlot('myDiv', levels.reverse(), consumptions.reverse(), dates.reverse())
    })
}

setTimeout(()=>{
    console.log('stack bar historic loaded!')
    console.log(`token: ${TOKEN}`)
    exec()
},250)
