import React, { Component } from 'react'
import Globe from 'worldwind-react-globe'

import './App.css'

export default class App extends Component {

  render() {
    // See Globe.defaultLayers for a list of layer string identifiers
    const layers = [{
        layer: "Sentinal2 with Labels", // partial names are ok
        options: {category: "base", enabled: true}
      }, {
        layer: "Compass",
        options: {category: "setting", enabled: true}
      }, {
        layer: "Coordinates",
        options: {category: "setting", enabled: true}
      }, {
        layer: "View Controls",
        options: {category: "setting", enabled: true}
      }, {
        layer: "Stars",
        options: {category: "setting", enabled: false, displayName: "Stars"}
      }
    ];
    return (
      <div className="fullscreen">
          <Globe 
              layers={layers}/>
      </div>
      )
  }
}
