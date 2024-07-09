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
- JavaScript / HTML / CSS 
- Webpack 
- LeafletJS 
- Leaflet Polyline Decorator
- OpenStreetMap 
- Google Icons, Font Awesome Icons, The Noun Project Icons

## Installation 
1. Download the **desAlgo-wbp-main.zip** in the Gdrive folder and unzip it.
2. Open your code editor/IDE of choice and open in it, the folder **desAlgo-wbp-main** located in the directory where you unzipped the zip file. 
3. Open your code editor's terminal and install NPM Packages using the command: 
    - **npm install** 
4. After installation, build and run the project using the commands: 
    - **npm run build**
    - **npm run dev**
    - If the project does not automatically open in your browser, look for 
    "[webpack-dev-server] Project is running at: 
     [webpack-dev-server] Loopback: http://localhost:____/" 
    in your terminal and go to the specified link

     ![Alt text](/docs/docs-terminal.png)

5. You can also visit the repository at https://github.com/jellyM0on/desAlgo-wbp to clone the repo and do steps 2-4 to run the project.

## Notes
Not mobile-compatible yet
