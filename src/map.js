import './styles/map.css'
import 'leaflet-polylinedecorator';
import homePinImg from './assets/pin-map-origin.svg'
import destPinImg from './assets/pin-map-dest.svg'
import defPinImg from './assets/pin-map-stop.svg'
import transPinImg from './assets/pin-map-transfer.svg'
import homeImg from './assets/pin-origin.svg'
import destImg from './assets/pin-destination.svg'
import infoImg from './assets/info.svg'

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

    let transIcon = L.icon({
        iconUrl: transPinImg,
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
                if(isTransfer(station, route[i-1]) == true){
                    marker = L.marker([x,y], {icon: transIcon}).addTo(map).bindPopup(`Transfer: ${station}`, {closeOnClick: false, autoClose: false}); 
                } else {
                    marker = L.marker([x,y], {icon: defIcon}).addTo(map).bindPopup(`${station}`, {closeOnClick: false, autoClose: false}); 
                }
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
let routes; 
const discountBool = typeInput == 'discount' ? 1 : 0; 

async function getRoutes(){
    await new Promise((resolve) => {
        setTimeout(() => {
            routes = findAllRoutes(originInput, destInput, typeInput, discountBool); 
            routes.forEach((route, i) => {
                route.id = i+1; 
            });             
            resolve(); 
        }, 100)
    })

    document.getElementById('loading').style.display = 'none';

    //display results 
    displayRoutes (routes, sortInput);
    
}

getRoutes(); 

let currentRoute = null; 

const routeOutput = document.querySelector('#output-results'); 
function createRouteNode(route, index){
    const distance = route.finalTotalDistance;
    const fair = route.finalTotalFair; 
    const travelTime = route.finalTravelTime; 
    const stationTrans = route.numStations; 
    const routeId = route.id; 

    const nodeBtn = document.createElement('button'); 
    nodeBtn.className = 'route-result'; 
    if(currentRoute == routeId){
        nodeBtn.classList.add('route-selected');
    } else {
        nodeBtn.classList.add('route-unselected');
    }
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
    routeTimeInfo.className = 'route-info'; 
    const routeExtraText2 = document.createElement('p'); 
    routeExtraText2.textContent = 'approx.'; 
    const routeTime= document.createElement('p'); 
    routeTime.className = 'route-time';
    routeTime.textContent = formatTime(travelTime); 
    routeTimeInfo.appendChild(routeExtraText2);
    routeTimeInfo.appendChild(routeTime); 
    nodeBtn.appendChild(routeTimeInfo); 

    routeOutput.appendChild(nodeBtn); 

    nodeBtn.addEventListener('click', () => { 
        //highlight chosen route
        let selectedNode = document.querySelector('.route-selected'); 
        if(selectedNode){
            selectedNode.classList.remove('route-selected');
            selectedNode.classList.add('route-unselected');
        }
        nodeBtn.classList.add('route-selected');
        currentRoute = routeId; 
        plotRoute(route);
        createInfoNode(route); 
    });
}

//helper function to determine if a station is an exchange station. dependent on station names
function isTransfer(currStation, prevStation){
    if(!prevStation) return false;
    let currLine = currStation.split('-')[0].trim();
    let prevLine = prevStation.split('-')[0].trim();

    return prevLine != currLine ? true : false; 
}

//route information panel button
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

//helper function to format time
function formatTime(travelTime) {
    if (travelTime < 60) {
      return `${travelTime} minutes`;
    } else if (travelTime % 60 !== 0) {
      return `${Math.floor(travelTime / 60)} hour/s and ${travelTime % 60} minute/s`;
    } else {
      return `${Math.floor(travelTime / 60)} hour/s`;
    }
  }

//route information panel 
function showRouteInfo(route){
    const infoContent = document.querySelector('#info-content'); 

    const list = document.createElement('div'); 
    list.id = 'info-content-list'; 

    const statsContainer = document.createElement('div'); 
    statsContainer.className = 'info-stats'; 
    const statsIcon = document.createElement('img'); 
    statsIcon.src = infoImg; 
    const statsContent = document.createElement('p'); 
    statsContent.innerText= `Php ${route.finalTotalFair}\n${formatTime(route.finalTravelTime)}\n${route.numStations} Transfers | ${route.finalTotalDistance} km`; 
    statsContainer.appendChild(statsIcon); 
    statsContainer.appendChild(statsContent); 
    list.appendChild(statsContainer);

    const stopList = document.createElement('ul');

    route = route.route; 
    let destNode = false; 

    //create label nodes for origin and destination stations
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

    //create label nodes for station exchange nodes
    function createTransferNode(){
        const transferLbl = document.createElement('div'); 
        transferLbl.className = 'transfer-label'
        const tLblIcon = document.createElement('img'); 
        tLblIcon.src = transPinImg; 
        const tLblText = document.createElement('p'); 
        tLblText.textContent = 'System Exchange Point'
        transferLbl.appendChild(tLblIcon); 
        transferLbl.appendChild(tLblText); 
        return transferLbl;
    }

    route.forEach((station, i) => {
        //if origin station
        if(i == 0){
            const originNode = createMainNode(homeImg, station);
            list.appendChild(originNode); 
        //if destination station
        } else if(route.length > 1 && i == route.length-1) {
            destNode = createMainNode(destImg, station); 
            if(isTransfer(station, route[i-1])){
                const itemContainer = document.createElement('div');
                itemContainer.className = 'transfer-dest'
                itemContainer.appendChild(createTransferNode()); 
                itemContainer.appendChild(destNode);
                destNode = itemContainer; 
            }
        //if stop station
        } else {
            const listItem = document.createElement('li'); 
            //if stop station is a transfer station
            if(isTransfer(station, route[i-1])){
                const itemContainer = document.createElement('div');
                itemContainer.className = 'transfer-route';

                const stationLbl = document.createElement('p'); 
                stationLbl.textContent = `${station}`; 
        
                itemContainer.appendChild(createTransferNode()); 
                itemContainer.appendChild(stationLbl)
                listItem.appendChild(itemContainer); 
            } else {
                listItem.textContent = `${station}`;
            }
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
        
        createRouteNode(route, i); 
    });
} 

//sort swap
const sortSwapBtn = document.querySelector('#sort-swap');
sortSwapBtn.addEventListener('click', () => {
    const output = document.getElementById("output-results");
    const routeNodes = Array.from(output.children); 
    
    for (let i = 0; i < Math.floor((routeNodes.length)/2); i++){
        const curr = routeNodes[i]; 
        const target = routeNodes[routeNodes.length-1-i]
        
        const currSibling = curr.nextSibling; 
        const targetSibling = target.nextSibling; 
        output.insertBefore(curr, targetSibling); 
        output.insertBefore(target, currSibling); 
    }
})