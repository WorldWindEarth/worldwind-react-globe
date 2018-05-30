# worldwind-react-globe | [demo](https://emxsys.github.io/worldwind-react-globe/)

> A 3D globe for React featuring maps, imagery and terrain plus 2D map projections using the [Web WorldWind](https://github.com/NASAWorldWind/WebWorldWind) virtual globe SDK from [NASA and ESA](https://worldwind.arc.nasa.gov/web/).

[![NPM](https://img.shields.io/npm/v/worldwind-react-globe.svg)](https://www.npmjs.com/package/worldwind-react-globe) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save worldwind-react-globe
```

## Usage

### Simple Example

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

- Adds layers to the Globe using [layer type names](#default-layer-types) defined in `Globe.defaultLayers`

##### App.js

```jsx

import React, { Component } from 'react'
import Globe from 'worldwind-react-globe'

import './App.css'

export default class App extends Component {
  render() {
    // See Globe.layerTypes 
    const layers = [
      "Sentinal-2 with Labels", // partial names are OK
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
```

##### App.css

```css

.fullscreen {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}
```

### Predefined Layer Types

Following is a list of the predefined layer type names available in `Globe.layerTypes`.

Layer Type Key | Layer Type Name | Description
-------------- | --------------- | --------------
__blue-marble__ | Blue Marble | Blue Marble Next Generation (BMNG)
__blue-marble-landsat__ | Blue Marble and LandSat | BMNG for oceans and seas with LandSat for land masses
__blue-marble-lowres__ | Background | Blue Marble low-resolution background image
__bing-aerial__ | Bing Aerial | Bing aerial imagery
__bing-aerial-labels__ | Bing Aerial with Labels | Bing aerial imagery with road and place name labels
__bing-roads__ | Bing Roads | Bing roads map
__eox-sentinal2__ | EOX Sentinal-2 | Sentinal 2 imagery from EOX IT Services GmbH
__eox-sentinal2-labels__ | EOX Sentinal-2 with Labels | Sentinal 2 imagery with OpenStreetMap overlay from EOX IT Services GmbH
__EOX OpenStreetMap__ | OpenStreetMap from EOX IT Services GmbH
__renderables__ | Renderables | A general purpose layer for hosting shapes and markers
__compass__ | Compass | A compass displayed in upper right
__coordinates__ | Coordinates | View coordinates displayed on top or bottom of screen
__view-controls__ | View Controls | View controls displayed in bottom left
__atmosphere-day-night__ | Atmosphere and Day/Night | Atmosphere and day/night effects
__stars__ | Stars | Background star field
__tessellation__ |Tessellation | Shows terrain tessellation

## License

MIT © [Bruce Schubert](https://github.com/emxsys)
