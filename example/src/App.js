import React, { Component } from 'react'
import Globe from 'worldwind-react-globe'

import './App.css'

export default class App extends Component {
  render() {
    // See Globe.defaultLayers for a list of layer string identifiers
    const layers = [
      "Sentinal2 with Labels", // partial names are OK
      "Compass",
      "Coordinates",
      "View Controls",
      "Atmosphere",
      "Stars"
    ];
    return (
      <div className="fullscreen">
          <Globe layers={layers}/>
      </div>
      )
  }
}
