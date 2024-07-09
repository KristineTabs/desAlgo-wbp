## About the Project 
BiyaHero is a web application which performs Depth First Search to get all routes from a starting station to a destination station. It covers the Philippine Rail System (LRT 1, LRT 2, MRT 3) and the EDSA Carousel System. 

## Features
/Home Page 
![Home page](/docs/docs-home.png)

/Map Page
![Map page](/docs/docs-map.png)

- Getting all possible routes from an origin station to a destination station with a specified ride type (Single Journey Ticket, BEEP Card, Discount)
- Sorting by Price, Transfers, Time in ascending or descending order
- Plotting the route on the map 
- Route information panel 

## Built With 
JavaScript / HTML / CSS 
Webpack 
LeafletJS 
Leaflet Polyline Decorator
OpenStreetMap 
Google Icons, Font Awesome Icons, The Noun Project Icons

## Installation 
1. Clone the repo 
2. Install NPM Packages 
    - npm install 
3. Build and run
    - npm run build
    - npm run dev 
    If the project does not automatically open in your browser, look for 
    "[webpack-dev-server] Project is running at: 
     [webpack-dev-server] Loopback: http://localhost:____/" 
    in your terminal and go to the specified link

## Notes
Not mobile-compatible yet
