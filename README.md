# worldwind-react-globe ([demo](https://emxsys.github.io/worldwind-react-globe/))

> A Globe component for React built with [NASA WorldWind](https://worldwind.arc.nasa.gov/web/).
>

[![NPM](https://img.shields.io/npm/v/worldwind-react-globe.svg)](https://www.npmjs.com/package/worldwind-react-globe) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save worldwind-react-globe
```

## Usage

### Simplest Example

Create a Globe using the defaults.

```jsx
import React, { Component } from 'react'
import Globe from 'worldwind-react-globe'

class App extends Component {
    render () {
        return (
            <div>
                <Globe />
            </div>
        )
    }
}
```

### Typical Example

Creates a Globe that fills the page.

- Adds layers to the Globe using layer identifiers defined in `Globe.defaultLayers`

##### App.js

```jsx

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
          <Globe layers={layers}/>
      </div>
    )
  }
}
```

##### App.css

```css

.fullscreen {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}
```

### Default Layers

Identifier | Description
---------- | --------------
__Blue Marble__ | Blue Marble Next Generation (BMNG)
__Blue Marble and LandSat__ | BMNG for oceans and seas with LandSat for land masses
__Bing Aerial__ | Bing aerial imagery
__Bing Aerial with Labels__ | Bing aerial imagery with road and place name labels
__Bing Roads__ | Bing roads map
__EOX Sentinal2__ | Sentinal 2 imagery from EOX IT Services GmbH
__EOX Sentinal2 with Labels__ | Sentinal 2 imagery with OpenStreetMap overlay from EOX IT Services GmbH
__EOX OpenStreetMap__ | OpenStreetMap from EOX IT Services GmbH
__Compass__ | A compass displayed in upper right
__Coordinates__ | View coordinates displayed on top or bottom of screen
__View Controls__ | View controls displayed in bottom left
__Atmosphere__ | Atmosphere and day/night effects
__Stars__ | Background star field
__Tessellation__ | Shows terrain tessellation

## License

MIT © [Bruce Schubert](https://github.com/emxsys)
