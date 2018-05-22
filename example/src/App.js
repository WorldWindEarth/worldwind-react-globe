import React, { Component } from 'react'
import Globe from 'worldwind-react-globe' 

import './App.css'

// WorldWind global is defined in the @nasaworldwind/worldwind module imported by Globe
/* global WorldWind */ 

export default class App extends Component {
        
    constructor(props) {
        super(props);
        // Holds a reference to the Globe component after mounting
        this.globeRef = React.createRef();
    }        
         
    componentDidMount() {
        // Get the Globe component with the WorldWindow (wwd) after mounting
        const globe = this.globeRef.current;
        
        // Define layers to be added to the globe.
        const layerConfig = [
            {layer: new WorldWind.BMNGLandsatLayer(),
                options: {category: "base", enabled: true}},
            {layer: new WorldWind.CompassLayer(),
                options: {category: "setting", enabled: false}},
            {layer: new WorldWind.CoordinatesDisplayLayer(globe.wwd),
                options: {category: "setting", enabled: true}},
            {layer: new WorldWind.ViewControlsLayer(globe.wwd),
                options: {category: "setting", enabled: true}},
            {layer: new WorldWind.StarFieldLayer(),
                options: {category: "setting", enabled: true, displayName: "Stars"}},
        ];
        // Add the layers to the globe
        layerConfig.forEach(config => globe.addLayer(config.layer, config.options));
    }
    
    render () {
        // Create a Globe in a div that fills the viewport.
        return (
            <div className="container">
                <Globe ref={this.globeRef}/>
            </div>
        )
    }
}
