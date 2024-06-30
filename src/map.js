import * as css from './styles/map.css'

import stationData from './assets/stationData.json';
import findAllRoutes from './getRoutes';

//generate select options
const originSelect = document.querySelector('#origin-select');
const destinationSelect = document.querySelector('#destination-select');
const typeSelect = document.querySelector('#type-select');

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

const originInput = getURLParams('origin'); 
const destInput = getURLParams('destination'); 
const typeInput = getURLParams('type');

//set current parameters to form data 
originSelect.value = originInput;
destinationSelect.value = destInput; 
typeSelect.value = typeInput; 

//get result 
const discountBool = typeInput == 'discount' ? 1 : 0; 
const routes = findAllRoutes(originInput, destInput, typeInput, discountBool); 

//display results 
const routeOutput = document.querySelector('#output'); 

routes.forEach((route, i) => {
    console.log(route); 
    createRouteNode(route, i)
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
        const testResult = document.querySelector('#testresult'); 
        testResult.textContent = route.route; 
        map.appendChild(testResult);
    })
}

//get routes button 
const submitBtn = document.querySelector('#map-submit')
submitBtn.addEventListener('click', () => {
    originInput = document.querySelector('#origin-select').value; 
    destInput = document.querySelector('#destination-select').value; 
    typeInput = document.querySelector('#type-select').value; 

    const url = (window.location.href).hostname + `map.html?origin=${encodeURIComponent(originInput)}&destination=${encodeURIComponent(destInput)}&type=${encodeURIComponent(typeInput)}`;
    window.location.href = url; 
})


