import * as css from './styles/map.css'

import stationData from './assets/stationData.json';
import findAllRoutes from './getRoutes';

//generate select options
const originSelect = document.querySelector('#origin-select');
const destinationSelect = document.querySelector('#destination-select');
const typeSelect = document.querySelector('#type-select');
const sortSelect = document.querySelector('#sort-select');

Object.keys(stationData).forEach((key) => {
    const originNode = document.createElement('option'); 
    const destNode = document.createElement('option'); 
    originNode.textContent = key; 
    destNode.textContent = key; 

    originNode.value = key;
    destNode.value = key;

    originNode.class = 'origin-station'
    destNode.class = 'dest-station'
    
    destinationSelect.appendChild(destNode); 
    originSelect.appendChild(originNode); 
})

//decode URL parameters

function getURLParams(name){
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

let originInput = getURLParams('origin'); 
let destInput = getURLParams('destination'); 
let typeInput = getURLParams('type');
let sortInput = getURLParams('sort');

//to set price as default value for first load
if (!sortInput) {
    sortInput = 'price';
}

//set current parameters to form data 
originSelect.value = originInput;
destinationSelect.value = destInput; 
typeSelect.value = typeInput; 
sortSelect.value = sortInput;

//initialize map
var map = L.map('map').setView([14.5793, 121.0008], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let markers = [];

//function to mark stations
function plotRoute(route){
    //remove previous markers
    markers.forEach((marker) => {
        map.removeLayer(marker); 
    })
    markers = []; 
    route = route.route;
    route.forEach((station, i) => {
      for(let obj in stationData){
        if(obj == station){
            const x = stationData[obj].coordinates[0];
            const y = stationData[obj].coordinates[1];
            var marker = L.marker([x,y]).addTo(map);
            markers.push(marker);
            if(i == 0){
                marker.bindPopup("Origin").openPopup()
            } else if(i == route.length - 1) {
                marker.bindPopup("Destination").openPopup()
            }
        }
      }
    })
}

//get result 
const discountBool = typeInput == 'discount' ? 1 : 0; 
const routes = findAllRoutes(originInput, destInput, typeInput, discountBool); 

const sortFields = {
    'price': 'finalTotalFair',
    'transfers': 'numStations',
    'time': 'finalTravelTime'
} 

//sort the routes before display
routes.sort((path1, path2) => {

    let sortBasis = sortFields[sortInput];
    return path1[sortBasis] < path2[sortBasis]? -1 : path1[sortBasis] > path2[sortBasis]? 1 : 0;  
});

//display results 
const routeOutput = document.querySelector('#output'); 

routes.forEach((route, i) => {
    console.log(route); 
    createRouteNode(route, i); 
})

function createRouteNode(route, index){
    const distance = route.finalTotalDistance;
    const fair = route.finalTotalFair; 
    const travelTime = route.finalTravelTime; 
    const stationTrans = route.numStations; 

    const nodeBtn = document.createElement('button'); 
    nodeBtn.className = 'route-result'; 
    nodeBtn.id = `route-${index}`;

    const routeName = document.createElement('p'); 
    routeName.textContent = `Route ${index} : ${distance} km`;
    routeName.className = 'route-name';
    nodeBtn.appendChild(routeName);

    const routeInfo = document.createElement('div'); 
    routeInfo.className = 'route-info'; 
    const routePrice = document.createElement('p'); 
    routePrice.className = 'route-price';
    routePrice.textContent = `Php ${fair}`; 
    const routeExtraText1 = document.createElement('p'); 
    routeExtraText1.textContent = 'with'; 
    const routeTransfers = document.createElement('p'); 
    routeTransfers.className = 'route-transfers';
    routeTransfers.textContent = `${stationTrans} Transfers`
    routeInfo.appendChild(routePrice); 
    routeInfo.appendChild(routeExtraText1); 
    routeInfo.appendChild(routeTransfers); 
    nodeBtn.appendChild(routeInfo); 

    const routeTimeInfo = document.createElement('div'); 
    routeInfo.className = 'route-info'; 
    const routeExtraText2 = document.createElement('p'); 
    routeExtraText2.textContent = 'approx.'; 
    const routeTime= document.createElement('p'); 
    routeTime.className = 'route-time';
    routeTime.textContent = `${travelTime} minutes`
    routeTimeInfo.appendChild(routeExtraText2);
    routeTimeInfo.appendChild(routeTime); 
    nodeBtn.appendChild(routeTimeInfo); 

    routeOutput.appendChild(nodeBtn); 

    nodeBtn.addEventListener('click', () => {
        plotRoute(route);
    })
}

//get routes button 
const submitBtn = document.querySelector('#map-submit');
submitBtn.addEventListener('click', () => {
    originInput = document.querySelector('#origin-select').value; 
    destInput = document.querySelector('#destination-select').value; 
    typeInput = document.querySelector('#type-select').value; 
    sortInput = document.querySelector('#sort-select').value;

    const url = (window.location.href).hostname + `map.html?origin=${encodeURIComponent(originInput)}&destination=${encodeURIComponent(destInput)}&type=${encodeURIComponent(typeInput)}&sort=${encodeURIComponent(sortInput)}`;
    window.location.href = url; 
});


// reloads when the sort by value changes
const sortSelected = document.querySelector('#sort-select');
sortSelected.addEventListener('change', () => {
    
    sortInput = sortSelected.options[sortSelected.selectedIndex].value;

    const url = window.location.origin + `/map.html?origin=${encodeURIComponent(originInput)}&destination=${encodeURIComponent(destInput)}&type=${encodeURIComponent(typeInput)}&sort=${encodeURIComponent(sortInput)}`;
    window.location.href = url;
});