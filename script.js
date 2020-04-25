let state = {
    overall: {

    },
    india: {},
    state: {
        name: 'Kerala',
        value: null
    },
    tempState: {
        name: 'Kerala',
        value: null
    },
    district: {
        name: '',
        value: null
    },
    covidData: null,
    search: '',
    suggestion: []
}

function setState(data) {
    let keys = Object.keys(data);
    keys.map((key) => {
        console.log(key, state[key], data.value);
        state[key] = data[key];
    })
    render();
}

function init() {
    render();
    getLocation();
    getCovidAPIState();
    getCovidAPIOverall();
}

function createChart(dataset){
    var ctx = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels:dataset.labels,
            datasets: [
                {
                    label: 'Recovered',
                    backgroundColor: 'rgba(80, 161, 100,0.4)',
                    borderColor: 'rgb(80, 161, 100)',
                    data: dataset.dataset.recovered
                },
                {
                    label: 'Deceased',
                    backgroundColor: 'rgba(80, 80, 80,0.4)',
                    borderColor: 'rgb(80, 80, 80)',
                    data: dataset.dataset.deceased
                },
                {
                    label: 'Confirmed',
                    backgroundColor: 'rgb(255, 99, 132,0.4)',
                    borderColor: 'rgb(255, 99, 132)',
                    data: dataset.dataset.confirmed
                }]
        },

        // Configuration options go here
        options: {
            scales:{
                xAxes: [{
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                }]
            }
        }
    });
}

function getLocation() {
    if (window.navigator.geolocation) {
        window.navigator.geolocation
            .getCurrentPosition(successfulLookup, errorLookup);
    }
}

function getCovidAPIOverall(){
    fetch('https://api.covid19india.org/data.json')
        .then(response => response.json())
        .then(data => {
            setState({overall: data, india:data.statewise[0]});
        })
}

function successfulLookup(position) {
    const { latitude, longitude } = position.coords;
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=1548879a07a84c93b0204189de3252d5`)
        .then(response => response.json())
        .then(data => {
            let locData = data.results[0].formatted.split(",");
            locData[1] = locData[1].split("-");
            loc = locData[2];
            dist = locData[1][0];
            let state = {
                name: locData[2].trim(),
                value: null
            };
            let district = {
                name: locData[1][0].trim(),
                value: null
            }
            setState({ state: state, district: district, tempState: state });
        })
}
function errorLookup(){
    console.log("Couldn't access location");
}

function getCovidAPIState() {
    fetch('https://api.covid19india.org/state_district_wise.json')
        .then(response => response.json())
        .then(data => {
            if (state.state.name == "") {
                let temp = Object.keys(data)[0];
                let newState = {
                    name: data[temp]
                }
                setState({ covidData: data, state: newState, tempState: newState });
            }
            else {
                setState({ covidData: data });
            }
            return true;
        })
        .catch(console.log)
}

function countryData(){
    if(Object.keys(state.india).length>0){
        let output = '';
        let data = state.india;
        let keys = ["confirmed", "active", "recovered", "deaths"]
        for (let i = 0; i < keys.length; i++) {
            output = output + `<div class="box ${keys[i]}">
                                        <div class="status">${keys[i]}</div>
                                        <div class="val">${data[keys[i]]}</div>
                                    </div>`;
        }
        console.log('out', output);
        return output;
    }
    else{
        return '';
    }
}

function singleDistrict() {
    if (state.covidData && state.state.name && state.district.name.length> 0) {
        let data = state.covidData[state.state.name].districtData[state.district.name];
        let output = '';
        let keys = Object.keys(data);
        for (let i = 1; i < keys.length - 1; i++) {
            output = output + `<div class="box ${keys[i]}">
                                        <div class="status">${keys[i]}</div>
                                        <div class="val">${data[keys[i]]}</div>
                                    </div>`;
        }
        return output;
    }
    else
        return countryData();
}

function stateStatus() {
    if (state.covidData && state.tempState.name) {
        let temp = singleState(state.tempState.name);
        let keys = Object.keys(temp);
        let output = '';
        for (let i = 0; i < keys.length; i++) {
            output = output + `<div class="box ${keys[i]}">
                                        <div class="status">${keys[i]}</div>
                                        <div class="val">${temp[keys[i]]}</div>
                                    </div>`;
        }
        return output;
    }
    else
        return '';
}

function singleState(stateName) {
    if (state.covidData && state.state.name) {
        let active = 0, confirmed = 0, deceased = 0, recovered = 0;
        let data = state.covidData[stateName].districtData;
        let dataList = Object.keys(data);
        for (let j = 0; j < dataList.length; j++) {
            active = active + data[dataList[j]].active;
            confirmed = confirmed + data[dataList[j]].confirmed;
            recovered = recovered + data[dataList[j]].recovered;
            deceased = deceased + data[dataList[j]].deceased;
        }
        let temp = { active, confirmed, recovered, deceased };
        // let keys = Object.keys(temp);
        // for (let i = 0; i < keys.length; i++) {
        //     output = output + `<div class="box ${keys[i]}">
        //                                 <div class="status">${keys[i]}</div>
        //                                 <div class="val">${temp[keys[i]]}</div>
        //                             </div>`;
        // }
        return temp;
    }
    else
        return {};
}

function tabulateStates() {
    if (state.covidData) {
        let data = state.covidData;
        let dataArray = Object.keys(data);
        let output = '';
        for (let i = 0; i < dataArray.length; i++) {
            let tempState = dataArray[i];
            let stateData = singleState(tempState);
            let keys = Object.keys(stateData);
            let line = '';
            for (let i = 0; i < keys.length; i++) {
                line = line + `<td>${stateData[keys[i]]}</td>`
            }
            output = output + `<tr><td style="cursor: pointer;" onclick="changeState('${tempState}')">${tempState}</td>${line}</tr>`;
        }
        return output;
    }
    else
        return '';
}

function tabulateDistricts() {
    if (state.covidData && state.tempState.name) {
        let data = state.covidData[state.tempState.name].districtData;
        let districtData = Object.keys(data);
        let output = '';
        for (let i = 0; i < districtData.length; i++) {
            let tempDistrict = districtData[i];
            let keys = ['confirmed', 'active', 'recovered', 'deceased'];
            let line = '';
            for (let j = 0; j < keys.length; j++) {
                line = line + `<td>${data[tempDistrict][keys[j]]}</td>`
            }
            output = output + `<tr><td>${tempDistrict}</td>${line}</tr>`;
        }
        return output;
    }
    else {
        return '';
    }
}

function changeState(stateName) {
    let temp = { name: stateName, value: null };
    setState({ tempState: temp });
}

function suggestionHandler() {
    let searchText = document.getElementById('search').value;
    if (state.covidData && searchText.length > 0) {
        let suggestion = Object.keys(state.covidData);
        let newSuggestions = suggestion.filter(e => e.toUpperCase().indexOf(searchText.toUpperCase()) > -1);
        let output = '';
        newSuggestions.map(item => {
            output = output + `<div class="suggestion" onclick="changeState('${item}')">${item}</div>`
        })
        document.getElementById('searchBar').style.borderBottomLeftRadius = '0px';
        document.getElementById('searchBar').style.borderBottomRightRadius = '0px';
        document.getElementById('suggestions').innerHTML = output;
    }
    else {
        document.getElementById('suggestions').innerHTML = '';
    }
}

function dataCountry(){
    let data = {
        labels : [],
        dataset: {
            confirmed: [],
            recovered: [],
            deceased: []
        }
    };
    if(state.overall.cases_time_series){
        let arr = state.overall.cases_time_series;
        arr.map(item => {
            data.labels.push(item.date);
            data.dataset.confirmed.push(item.totalconfirmed);
            data.dataset.recovered.push(item.totalrecovered);
            data.dataset.deceased.push(item.totaldeceased);
        })
    }
    return data;
}

function render() {
    document.getElementById('wrapper').innerHTML = ` 
    <div class="top">
        <h1 class="header">COVID-19 Tracker</h1>
        <div class="districtContainer" id="districtContainer">
            <h1>${state.district.name.length ? state.district.name : 'India'}</h1>
            <div class="districtBoxes">
                ${singleDistrict()}
            </div>
        </div>
    </div>
    <div class="bottom">
        <div class="container">
            <div class="left">
                <div class="searchBar" id="searchBar">
                    <input type="text" id="search" placeholder="Search state" oninput="suggestionHandler()">
                    <div class="suggestions" id="suggestions">
                    </div>
                </div>
                <div class="stateContainer" id="stateContainer">
                    <h1>${state.tempState.name ? state.tempState.name : 'Kerala'}</h1>
                    <div class="stateBoxes">
                        ${stateStatus()}
                    </div>
                </div>
                <div class="tableContainer">
                    <table>
                        <tr>
                            <th>State</th>
                            <th>Confirmed</th>
                            <th>Active</th>
                            <th>Recovered</th>
                            <th>Deceased</th>
                        </tr>
                        ${tabulateDistricts()}
                    </table>
                </div>
                
            </div>
            <div class="right">
                <h3>Cases in India</h3>
                <canvas id="myChart"></canvas>
                <h3>India</h3>
                <div class="tableContainer">
                    <table>
                        <tr>
                            <th>State</th>
                            <th>Confirmed</th>
                            <th>Active</th>
                            <th>Recovered</th>
                            <th>Deceased</th>
                        </tr>
                        ${tabulateStates()}
                    </table>
                </div>
            </div>
        </div>
    </div>`;
    createChart(dataCountry());
}
