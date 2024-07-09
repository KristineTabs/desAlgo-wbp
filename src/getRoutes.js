import stationData from './assets/stationData.json'


const fareMatrix = stationData; 

//computes travel time of a sub path depending on the speed of the vehicle in the system
function computeTravelTime (station, currTravelTime, subPathDistance) {

    if (fareMatrix[station]['systemLine'] === 'EDSA Carousel') {
        currTravelTime += (subPathDistance / 21) * 60;
    }
    else {
        currTravelTime += (subPathDistance / 60) * 60;
    }

    return currTravelTime;
}

//computes fair based on the corresponding line system of the path in fareMatrix json file 
function computeFair (firstFair, secondFair, originStation, destinationStation, currTotalFare, discounted, journeyType) {
    
    switch (fareMatrix[destinationStation]['systemLine']) {

        case 'LRT 1':
        case 'LRT 2':
            if (journeyType === 'beep'){
                currTotalFare += Math.ceil(secondFair);
            }
            else {
                discounted? currTotalFare += Math.ceil(firstFair - firstFair * 0.20) : currTotalFare += firstFair;
            }
            break;

        case 'MRT 3':
            discounted? currTotalFare += Math.ceil(firstFair - firstFair * 0.20) : currTotalFare += firstFair;
            break;
        
        case 'EDSA Carousel':
            if (fareMatrix[originStation]['stopOrder'] < fareMatrix[destinationStation]['stopOrder']) {
                discounted? currTotalFare += Math.ceil(firstFair - firstFair * 0.20) : currTotalFare += Math.ceil(firstFair);
            }
            else {
                discounted? currTotalFare += Math.ceil(secondFair - secondFair * 0.20) : currTotalFare += Math.ceil(secondFair);
            }
            break;
    }

    return currTotalFare;
}

function findAllRoutes(origin, destination, typeOfRide, discount) {

    const graph = {
        //LRT 1
        'LRT 1 - Fernando Poe Jr./Roosevelt': [['LRT 1 - Balintawak', 1.87], ['Carousel - Roosevelt', 0, 10]],
        'LRT 1 - Balintawak': [['LRT 1 - Yamaha Monumento', 2.25], ['LRT 1 - Fernando Poe Jr./Roosevelt', 1.87], ['Carousel - Balintawak', 0, 1]], //transfer point
        'LRT 1 - Yamaha Monumento': [['LRT 1 - 5th Avenue', 1.087], ['LRT 1 - Balintawak', 2.25], ['Carousel - Monumento', 0, 10]],
        'LRT 1 - 5th Avenue': [['LRT 1 - R. Papa', 0.954], ['LRT 1 - Yamaha Monumento', 1.087]],
        'LRT 1 - R. Papa': [['LRT 1 - Abad Santos', 0.66], ['LRT 1 - 5th Avenue', 0.954]],
        'LRT 1 - Abad Santos': [['LRT 1 - Blumentritt', 0.927], ['LRT 1 - R. Papa', 0.66]],
        'LRT 1 - Blumentritt': [['LRT 1 - Tayuman', 0.671], ['LRT 1 - Abad Santos', 0.927]],
        'LRT 1 - Tayuman': [['LRT 1 - Bambang', 0.618], ['LRT 1 - Blumentritt', 0.671]],
        'LRT 1 - Bambang': [['LRT 1 - Doroteo Jose', 0.648], ['LRT 1 - Tayuman', 0.618]],
        'LRT 1 - Doroteo Jose': [['LRT 1 - Carriedo', 0.685], ['LRT 1 - Bambang', 0.648], ['LRT 2 - Recto', 0, 3]], //transfer point
        'LRT 1 - Carriedo': [['LRT 1 - Central Terminal', 0.725], ['LRT 1 - Doroteo Jose', 0.685]],
        'LRT 1 - Central Terminal': [['LRT 1 - United Nations', 1.214], ['LRT 1 - Carriedo', 0.725]],
        'LRT 1 - United Nations': [['LRT 1 - Pedro Gil', 0.754], ['LRT 1 - Central Terminal', 1.214]],
        'LRT 1 - Pedro Gil': [['LRT 1 - Quirino', 0.794], ['LRT 1 - United Nations', 0.754]],
        'LRT 1 - Quirino': [['LRT 1 - Vito Cruz', 0.827], ['LRT 1 - Pedro Gil', 0.794]],
        'LRT 1 - Vito Cruz': [['LRT 1 - Gil Puyat', 1.061], ['LRT 1 - Quirino', 0.827]],
        'LRT 1 - Gil Puyat': [['LRT 1 - Libertad', 0.73], ['LRT 1 - Vito Cruz', 1.061]],
        'LRT 1 - Libertad': [['LRT 1 - EDSA', 1.01], ['LRT 1 - Gil Puyat', 0.73]],
        'LRT 1 - EDSA': [['LRT 1 - Baclaran', 0.588], ['LRT 1 - Libertad', 1.01], ['MRT 3 - Taft Avenue', 0, 8], ['Carousel - Taft Avenue', 0, 8]], //transfer point
        'LRT 1 - Baclaran': [['LRT 1 - EDSA', 0.588]],
    
        //LRT 2
        'LRT 2 - Recto': [['LRT 2 - Legarda', 1.05], ['LRT 1 - Doroteo Jose', 0, 3]], //transfer point
        'LRT 2 - Legarda': [['LRT 2 - Pureza', 1.389], ['LRT 2 - Recto', 1.05]],
        'LRT 2 - Pureza': [['LRT 2 - V. Mapa', 1.357], ['LRT 2 - Legarda', 1.389]],
        'LRT 2 - V. Mapa': [['LRT 2 - J. Ruiz', 1.234], ['LRT 2 - Pureza', 1.357]],
        'LRT 2 - J. Ruiz': [['LRT 2 - Gilmore', 0.928], ['LRT 2 - V. Mapa', 1.234]],
        'LRT 2 - Gilmore': [['LRT 2 - Betty Go-Belmonte', 1.075], ['LRT 2 - J. Ruiz', 0.928]],
        'LRT 2 - Betty Go-Belmonte': [['LRT 2 - Araneta Center-Cubao', 1.164], ['LRT 2 - Gilmore', 1.075]],
        'LRT 2 - Araneta Center-Cubao': [['LRT 2 - Anonas', 1.438], ['LRT 2 - Betty Go-Belmonte', 1.164], ['MRT 3 - Araneta Center-Cubao', 0, 7]], //transfer point
        'LRT 2 - Anonas': [['LRT 2 - Katipunan', 0.955], ['LRT 2 - Araneta Center-Cubao', 1.438]],
        'LRT 2 - Katipunan': [['LRT 2 - Santolan', 1.97], ['LRT 2 - Anonas', 0.955]],
        'LRT 2 - Santolan': [['LRT 2 - Marikina-Pasig', 1.70], ['LRT 2 - Katipunan', 1.97]],
        'LRT 2 - Marikina-Pasig': [['LRT 2 - Antipolo', 2.60], ['LRT 2 - Santolan', 1.70]],
        'LRT 2 - Antipolo': [['LRT 2 - Marikina-Pasig', 2.60]],
    
        //MRT 3
        'MRT 3 - North Avenue': [['MRT 3 - Quezon Avenue', 1.22], ['Carousel - North Avenue', 0, 5]], 
        'MRT 3 - Quezon Avenue': [['MRT 3 - GMA Kamuning', 0.94], ['MRT 3 - North Avenue', 1.22], ['Carousel - Quezon Avenue', 0, 2]], //transfer point
        'MRT 3 - GMA Kamuning': [['MRT 3 - Araneta Center-Cubao', 1.85], ['MRT 3 - Quezon Avenue', 0.94]], 
        'MRT 3 - Araneta Center-Cubao': [['MRT 3 - Santolan-Annapolis', 1.45], ['MRT 3 - GMA Kamuning', 1.85], ['LRT 2 - Araneta Center-Cubao', 0, 7]], //transfer point
        'MRT 3 - Santolan-Annapolis': [['MRT 3 - Ortigas', 2.31], ['MRT 3 - Araneta Center-Cubao', 1.45]],
        'MRT 3 - Ortigas': [['MRT 3 - Shaw Boulevard', 0.77], ['MRT 3 - Santolan-Annapolis', 2.31], ['Carousel - Ortigas', 0, 4]], //transfer point
        'MRT 3 - Shaw Boulevard': [['MRT 3 - Boni', 0.98], ['MRT 3 - Ortigas', 0.77]],
        'MRT 3 - Boni': [['MRT 3 - Guadalupe', 0.77], ['MRT 3 - Shaw Boulevard', 0.98]],
        'MRT 3 - Guadalupe': [['MRT 3 - Buendia', 1.83], ['MRT 3 - Boni', 0.77], ['Carousel - Guadalupe', 0, 2]], //transfer point
        'MRT 3 - Buendia': [['MRT 3 - Ayala', 0.88], ['MRT 3 - Guadalupe', 1.83], ['Carousel - Buendia', 0, 4]], //transfer point
        'MRT 3 - Ayala': [['MRT 3 - Magallanes', 1.19], ['MRT 3 - Buendia', 0.88], ['Carousel - Ayala', 0, 6]],
        'MRT 3 - Magallanes': [['MRT 3 - Taft Avenue', 1.89], ['MRT 3 - Ayala', 1.19]],
        'MRT 3 - Taft Avenue': [['MRT 3 - Magallanes', 1.89], ['LRT 1 - EDSA', 0, 8], ['Carousel - Taft Avenue', 0, 8]], //transfer point
    
        //EDSA Carousel
        'Carousel - Monumento': [['Carousel - Bagong Barrio', 0.55], ['LRT 1 - Yamaha Monumento', 0, 10]],
        'Carousel - Bagong Barrio': [['Carousel - Balintawak', 1.55], ['Carousel - Monumento', 0.55]],
        'Carousel - Balintawak': [['Carousel - Kaingin Road', 0.80], ['Carousel - Bagong Barrio', 1.55], ['LRT 1 - Balintawak', 0, 1]], //transfer point
        'Carousel - Kaingin Road': [['Carousel - Roosevelt', 1.10], ['Carousel - Balintawak', 0.80]],
        'Carousel - Roosevelt': [['Carousel - North Avenue', 1.50], ['Carousel - Kaingin Road', 1.10], ['LRT 1 - Fernando Poe Jr./Roosevelt', 0, 10]],
        'Carousel - North Avenue': [['Carousel - Quezon Avenue', 1.30], ['Carousel - Roosevelt', 1.50], ['MRT 3 - North Avenue', 0, 5]], 
        'Carousel - Quezon Avenue': [['Carousel - Nepa Q-Mart', 1.80], ['Carousel - North Avenue', 1.30], ['MRT 3 - Quezon Avenue', 0, 2]], //transfer point
        'Carousel - Nepa Q-Mart': [['Carousel - Main Avenue', 1.60], ['Carousel - Quezon Avenue', 1.80]],
        'Carousel - Main Avenue': [['Carousel - Santolan', 0.80], ['Carousel - Nepa Q-Mart', 1.60]],
        'Carousel - Santolan': [['Carousel - Ortigas', 2.40], ['Carousel - Main Avenue', 0.80]],
        'Carousel - Ortigas': [['Carousel - Guadalupe', 2.40], ['Carousel - Santolan', 2.40], ['MRT 3 - Ortigas', 0, 4]], //transfer point
        'Carousel - Guadalupe': [['Carousel - Buendia', 2.00], ['Carousel - Ortigas', 2.40], ['MRT 3 - Guadalupe', 0, 2]], //transfer point
        'Carousel - Buendia': [['Carousel - Ayala', 2.90], ['Carousel - Guadalupe', 2.00], ['MRT 3 - Buendia', 0, 4]], //transfer point
        'Carousel - Ayala': [['Carousel - Tramo', 4.20], ['Carousel - Buendia', 2.90], ['MRT 3 - Ayala', 0, 6]],
        'Carousel - Tramo': [['Carousel - Taft Avenue', 0.40]],
        'Carousel - Taft Avenue': [['Carousel - Roxas Boulevard', 0.80], ['Carousel - Ayala', 4.70], ['MRT 3 - Taft Avenue', 0, 8], ['LRT 1 - EDSA', 0, 8]],
        'Carousel - Roxas Boulevard': [['Carousel - MOA', 1.30], ['Carousel - Taft Avenue', 0.80]],
        'Carousel - MOA': [['Carousel - DFA/Starbucks', 1.40]],
        'Carousel - DFA/Starbucks': [['Carousel - Ayala Malls Manila Bay/City of Dreams', 0.90], ['Carousel - Roxas Boulevard', 1.10]],
        'Carousel - Ayala Malls Manila Bay/City of Dreams': [['Carousel - PITX', 5.30], ['Carousel - DFA/Starbucks', 0.90]],
        'Carousel - PITX': [['Carousel - Ayala Malls Manila Bay/City of Dreams', 5.30]]
    };

    //executes dfs algorithm to find all possible paths from origin station to destination station 
    function implementDFS(currStation, destination, route, visited, allRoutes, finalTotalDistance, subPathDistance, currTotalFare, currTravelTime, routeTransfer, firstStation, prevStation, rideType, isDiscounted, oldBound, newBound, tempFair) {
       
        route.push(currStation); //places the current visited station in the current route
        visited.add(currStation);

        if (fareMatrix[currStation]['systemLine'] === 'EDSA Carousel') {

            fareMatrix[prevStation]['stopOrder'] <= fareMatrix[currStation]['stopOrder']? newBound = 0 : newBound = 1;

            if (oldBound !== newBound) {
                currTotalFare += tempFair;
                firstStation = prevStation;
            }
            oldBound = newBound;
            tempFair = 0;
        }

        let firstFair, secondFair;
        
        if (fareMatrix[currStation]['systemLine'] !== fareMatrix[prevStation]['systemLine']) { //checks if the route switched to another system line

            routeTransfer++; //counts how many times a system line transfer happened in a route

            currTravelTime = computeTravelTime(prevStation, currTravelTime, subPathDistance);

            subPathDistance = 0; 

            for (const [adjacentStation, distance, travelTime] of graph[prevStation]) { //includes the walking time in the travel time when transferring to other system lines
                if (adjacentStation === currStation) {
                    currTravelTime += travelTime;
                }
            }

            if (fareMatrix[firstStation][prevStation]) { //checks if the fare data from origin to destination exist. if not, it swaps the stations. 

                firstFair = fareMatrix[firstStation][prevStation][0];
                secondFair = fareMatrix[firstStation][prevStation][1];

                currTotalFare = computeFair(firstFair, secondFair, firstStation, prevStation, currTotalFare, isDiscounted, rideType);
            }
            else if (fareMatrix[prevStation][firstStation]) {

                firstFair = fareMatrix[prevStation][firstStation][0];
                secondFair = fareMatrix[prevStation][firstStation][1];

                currTotalFare = computeFair(firstFair, secondFair, firstStation, prevStation, currTotalFare, isDiscounted, rideType);
            }

            firstStation = currStation; //sets the current station as the first station of a new subpath
  
        }

        prevStation = currStation; //sets the current station as the previous station before moving on to the next subpath

        if (currStation === destination) {

            if (firstStation !== destination) { //prevents the first station from recalculating previous subpath if it is already the destination

                currTravelTime = computeTravelTime(prevStation, currTravelTime, subPathDistance);

                subPathDistance = 0;

                if (fareMatrix[firstStation][currStation]) {

                    firstFair = fareMatrix[firstStation][currStation][0];
                    secondFair = fareMatrix[firstStation][currStation][1];

                    currTotalFare = computeFair(firstFair, secondFair, firstStation, currStation, currTotalFare, isDiscounted, rideType);
                }
                else if (fareMatrix[currStation][firstStation]) {

                    firstFair = fareMatrix[currStation][firstStation][0];
                    secondFair = fareMatrix[currStation][firstStation][1];

                    currTotalFare = computeFair(firstFair, secondFair, firstStation, currStation, currTotalFare, isDiscounted, rideType);
                }
            }
            
            currTravelTime += (route.length - routeTransfer - 1) * 0.5; //takes the loading and unloading time in each stations stop into consideration

            allRoutes.push({ //includes the route in the list of possible routes
                route: [...route],
                finalTotalDistance: finalTotalDistance.toFixed(2),
                finalTravelTime: Math.ceil(currTravelTime), 
                finalTotalFair: currTotalFare,
                numStations: route.length - 1
            });

        } 
        else {

            for (const [adjacentStation, distance, travelTime] of graph[currStation]) { //checks unvisited adjacent stations from the current station

                if (fareMatrix[currStation][adjacentStation]) {
                    tempFair = fareMatrix[currStation][adjacentStation][0];
                }
                else if (fareMatrix[adjacentStation][currStation]){
                    tempFair = fareMatrix[adjacentStation][currStation][0];
                }

                if (!visited.has(adjacentStation)) { //if the adjacent station is not yet visited, we visit deeper into the path
                    implementDFS(adjacentStation, destination, route, visited, allRoutes, finalTotalDistance + distance, subPathDistance + distance, currTotalFare, currTravelTime, routeTransfer, firstStation, prevStation, rideType, isDiscounted, oldBound, newBound, tempFair);
                }
            }
        }

        route.pop(); //backtracks to the station with unvisited adjacent stations
        visited.delete(currStation);
    }

    let allRoutes = [];
    let firstStation = origin;
    let prevStation = origin;

    implementDFS(origin, destination, [], new Set(), allRoutes, 0, 0, 0, 0, 0, firstStation, prevStation, typeOfRide, discount, 0, 0, 0);
    
    return allRoutes;
}


export default findAllRoutes; 