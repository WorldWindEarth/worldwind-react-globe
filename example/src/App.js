import React, { Component } from 'react'
import Globe from 'worldwind-react-globe'
import WorldWind from '@nasaworldwind/worldwind';

import './App.css'

export default class App extends Component {
        
    constructor(props) {
        super(props);
        
        // Holds a reference to the Globe component after mounting
        this.globeRef = React.createRef();
        
        // Define the WorldWind base URL for image resources.
        // As an alternative, you can copy the images folder from 
        // https://files.worldwind.arc.nasa.gov/artifactory/web/0.9.0/
        // to the root of your web app (e.g., to public)
        WorldWind.configuration.baseUrl = 'https://files.worldwind.arc.nasa.gov/artifactory/web/0.9.0/';
    }        
         
    componentDidMount() {
        // Get the Globe component with the WorldWindow after mounting
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
        // 
        // The id prop defines the element id for the Globe's canvas and is required.
        // The projection prop is optional, 3D is the default.
        return (
            <div className="fullsize">
                <Globe 
                    ref={this.globeRef}
                    id="globe-canvas"
                    projection="3D"/>
            </div>
        )
    }
}
