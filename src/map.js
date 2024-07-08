import * as css from './styles/map.css'
import 'leaflet-polylinedecorator';
import homePinImg from './assets/pin-map-origin.svg'
import destPinImg from './assets/pin-map-dest.svg'
import defPinImg from './assets/pin-map-stop.svg'
import homeImg from './assets/pin-origin.svg'
import destImg from './assets/pin-destination.svg'

import collapseUp from './assets/collapse-up.svg'
import collapseDown from './assets/collapse-down.svg'

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
});

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
let polylines = [];

//function to mark stations
function plotRoute(route){
    //remove previous markers
    let previousMarker = null; 
    markers.forEach((marker, i) => {
        map.removeLayer(marker); 
    });

    polylines.forEach((polyline) => {
        map.removeLayer(polyline.line);
        map.removeLayer(polyline.arrow);
    });

    markers = []; 
    polylines = [];
    route = route.route;

    //custom map pin icons
    let homeIcon = L.icon({
        iconUrl: homePinImg,
        iconSize: [25, 45], 
        iconAnchor: [15, 35], 
        popupAnchor: [1, -34]
    });

    let destIcon = L.icon({
        iconUrl: destPinImg,
        iconSize: [25, 45], 
        iconAnchor: [15, 35], 
        popupAnchor: [1, -34]
    })

    let defIcon = L.icon({
        iconUrl: defPinImg,
        iconSize: [15, 25], 
        popupAnchor: [1, -10]
    })

    route.forEach((station, i) => {
      for(let obj in stationData){
        if(obj == station){
            const x = stationData[obj].coordinates[0];
            const y = stationData[obj].coordinates[1];
            let marker;
            if(i == 0){
                marker = L.marker([x,y], {icon: homeIcon}).addTo(map).bindPopup(`Origin: ${station}`, {closeOnClick: false, autoClose: false}).openPopup();
            } else if(i == route.length - 1) {
                marker =  L.marker([x,y], {icon: destIcon}).addTo(map).bindPopup(`Destination: ${station}`, {closeOnClick: false, autoClose: false}).openPopup();
            } else {
                marker = L.marker([x,y], {icon: defIcon}).addTo(map).bindPopup(`${station}`, {closeOnClick: false, autoClose: false}); 
            };

            //enable hover with click
            let clickState = false; 
            marker.on('mouseover', function(e) {
                if(!clickState) this.openPopup(); 
            });
            marker.on('mouseout', function(e){
                if(!clickState) this.closePopup();
            });
            marker.on('click', function(e){
                clickState = true; 
                this.openPopup(); 
            }); 
            marker.on('popupclose', function(e){
                clickState = false; 
            });

            markers.push(marker);
           
            //polylines
            if (previousMarker) {
                let polyline = L.polyline([
                    [previousMarker.getLatLng().lat, previousMarker.getLatLng().lng],
                    [marker.getLatLng().lat, marker.getLatLng().lng]
                ], { color: 'black' }).addTo(map);

                var arrowHead = L.polylineDecorator(polyline, {
                    patterns: [
                      { offset: '50%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 10, polygon: false, pathOptions: { stroke: true, color: 'black' } }) }
                    ]
                  }).addTo(map);

                polylines.push({"line": polyline, "arrow": arrowHead})
            }
            previousMarker = marker;
        }
      }
    });
}

//get result 
const discountBool = typeInput == 'discount' ? 1 : 0; 
const routes = findAllRoutes(originInput, destInput, typeInput, discountBool); 

//display results 
const routeOutput = document.querySelector('#output-results'); 
displayRoutes (routes, sortInput);


function createRouteNode(route, index){
    const distance = route.finalTotalDistance;
    const fair = route.finalTotalFair; 
    const travelTime = route.finalTravelTime; 
    const stationTrans = route.numStations; 

    const nodeBtn = document.createElement('button'); 
    nodeBtn.className = 'route-result'; 
    nodeBtn.id = `route-${index}`;

    const routeName = document.createElement('p'); 
    distance == 0 ? routeName.textContent = `Route ${index + 1} : Walking Distance`: routeName.textContent = `Route ${index + 1} : ${distance} km`;
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
        createInfoNode(route); 
    });
}


function createInfoNode(route){

    function removePrev(){
        const infoContent = document.querySelector('#info-content'); 
        if (infoContent.firstElementChild){
            infoContent.removeChild(infoContent.firstElementChild)
        };
    }

    removePrev(); 

    const oldInfoPanel = document.querySelector('#info-panel'); 
    const newInfoPanel = oldInfoPanel.cloneNode(true); 
    oldInfoPanel.parentNode.replaceChild(newInfoPanel, oldInfoPanel);
    newInfoPanel.style.visibility = "unset"; 

    const infoBtn = document.querySelector('#info-header');
    const btnImg = document.querySelector('#info-header-img');
    let isClicked = true;

    infoBtn.addEventListener('click', () => {
        if(isClicked){
            isClicked = false; 
            btnImg.src = collapseUp; 
            showRouteInfo(route);
        } else {
            isClicked = true; 
            btnImg.src = collapseDown; 
            removePrev();  
        }
    }); 

}

function showRouteInfo(route){
    const infoContent = document.querySelector('#info-content'); 

    const list = document.createElement('div'); 
    list.id = 'info-content-list'; 

    const stopList = document.createElement('ul');

    route = route.route; 

    let destNode = false; 

    function createMainNode(imgSrc, station){
        const containerNode = document.createElement('div');
        containerNode.className = 'info-main'
        const icon = document.createElement('img'); 
        const text = document.createElement('p'); 
        icon.src = imgSrc; 

        text.textContent = `${station}`; 
        containerNode.appendChild(icon); 
        containerNode.appendChild(text); 

        return containerNode;
    }

    route.forEach((station, i) => {
        if(i == 0){
            const originNode = createMainNode(homeImg, station);
            list.appendChild(originNode); 
        } else if(route.length > 1 && i == route.length-1) {
            destNode = createMainNode(destImg, station); 
        } else {
            const listItem = document.createElement('li'); 
            listItem.textContent = `${station}`;
            stopList.appendChild(listItem); 
        }
    })

    list.appendChild(stopList); 
    if(destNode) list.appendChild(destNode); 

    infoContent.appendChild(list);
}

//get routes button 
const submitBtn = document.querySelector('#map-submit');
submitBtn.addEventListener('click', () => {
    originInput = document.querySelector('#origin-select').value; 
    destInput = document.querySelector('#destination-select').value; 
    typeInput = document.querySelector('#type-select').value; 

    const url = (window.location.href).hostname + `map.html?origin=${encodeURIComponent(originInput)}&destination=${encodeURIComponent(destInput)}&type=${encodeURIComponent(typeInput)}&sort=${encodeURIComponent(sortInput)}`;
    window.location.href = url; 
});


//sort options
const sortSelected = document.querySelector('#sort-select');
sortSelected.addEventListener('change', () => {

    const output = document.getElementById("output-results");
    const nodesArr = Array.from(output.children);

    for (let node = 0; node < nodesArr.length; node++) {
        output.removeChild(nodesArr[node]);
    }

    sortInput = sortSelected.options[sortSelected.selectedIndex].value;
    displayRoutes (routes, sortInput);

});

//sorts and displays paths
function displayRoutes (paths, sortType) {
    
    const sortFields = {
        'price': 'finalTotalFair',
        'transfers': 'numStations',
        'time': 'finalTravelTime'
    } 
    
    paths.sort((path1, path2) => {
    
        let sortBasis = sortFields[sortType];
        return path1[sortBasis] < path2[sortBasis]? -1 : path1[sortBasis] > path2[sortBasis]? 1 : 0;  
    });

    paths.forEach((route, i) => {
        console.log(route); 
        createRouteNode(route, i); 
    });
} 
