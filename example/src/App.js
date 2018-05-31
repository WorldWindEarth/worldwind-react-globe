/* 
 * Copyright (c) 2018 Bruce Schubert.
 * The MIT License
 * http://www.opensource.org/licenses/mit-license
 */
import React, { Component } from 'react'
import Globe from 'worldwind-react-globe'

import './App.css'
export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      lat: 34.2,
      lon: -119.2,
      alt: 10e6
    }
    this.globeRef = React.createRef();
  }

  render() {
    // See Globe.layerTypes for a list of predefined layers
    const layers = [
      "eox-sentinal2-labels",
      "coordinates",
      "view-controls",
      "stars",
      "atmosphere-day-night"
    ];

    return (
        <div className="fullscreen">
            <Globe 
                ref={this.globeRef}
                layers={layers}
                latitude={this.state.lat}
                longitude={this.state.lon}
                altitude={this.state.alt} 
                />
        </div>
    )
  }
}
