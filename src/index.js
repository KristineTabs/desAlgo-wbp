import * as css from './styles/home.css';
import stationData from './assets/stationData.json';

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

const submitBtn = document.querySelector('#home-submit'); 
submitBtn.addEventListener('click', (e) => {
    e.preventDefault(); 
    const originInput = originSelect.value; 
    const destInput = destinationSelect.value; 
    const typeInput = typeSelect.value; 
    // const url = window.location.href + 'map.html'
    const url = window.location.href + `map.html?origin=${encodeURIComponent(originInput)}&destination=${encodeURIComponent(destInput)}&type=${encodeURIComponent(typeInput)}`;
    window.location.href = url; 
})