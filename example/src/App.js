import React, { Component } from 'react'
import Globe from 'worldwind-react-globe' 

import './App.css'

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
        // See Globe.defaultLayers for a list of valid string identifiers
        const layerConfig = [ 
            {layer: "Sentinal2 with Labels",  // partial names are ok
                options: {category: "base", enabled: true}},
            {layer: "Compass",
                options: {category: "setting", enabled: true}},
            {layer: "Coordinates",
                options: {category: "setting", enabled: true}},
            {layer: "View Controls",
                options: {category: "setting", enabled: true}},
            {layer: "Stars",
                options: {category: "setting", enabled: false, displayName: "Stars"}},
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
