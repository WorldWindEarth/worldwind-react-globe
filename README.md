# worldwind-react-globe 

> A 3D globe for React featuring maps, imagery and terrain plus 2D map projections using the [Web WorldWind](https://github.com/NASAWorldWind/WebWorldWind) virtual globe SDK from [NASA and ESA](https://worldwind.arc.nasa.gov/web/).
>
> [Demo](https://emxsys.github.io/worldwind-react-globe/)

[![NPM](https://img.shields.io/npm/v/worldwind-react-globe.svg)](https://www.npmjs.com/package/worldwind-react-globe) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save worldwind-react-globe
```

## Usage

### Example #1: Simple

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

### Example #2: Normal

Creates a Globe that fills the page.

- Adds layers to the Globe using [layer type keys](#predefined-layer-types) 
defined in `Globe.layerTypes`
- Sets the startup latitude and longitude coordinates (in decimal degrees)and 
the eye/camera altitude (in meters)

##### App.js

```jsx
import React, { Component } from 'react'
import Globe from 'worldwind-react-globe'
import './App.css'

export default class App extends Component {
  render() {

    const layers = [
      'eox-sentinal2-labels',
      'coordinates',
      'view-controls',
      'stars',
      'atmosphere-day-night'
    ];

    return (
      <div className='fullscreen'>
        <Globe 
          ref={this.globeRef}
          layers={layers}
          latitude={34.2}
          longitude={-119.2}
          altitude={10e6} 
        />
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

### Example #3: More Complex

Creates a Globe that fills the page.

- Adds layers to the Globe using [layer type keys](#predefined-layer-types) 
defined in `Globe.layerTypes`
- Sets and changes the globe's latitude and longitude coordinates and the 
eye/camera altitude via the component's state.
- Uses a `ref` object to get a references to the Globe

##### App.js

```jsx
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
    const layers = [
      'eox-sentinal2-labels',
      'coordinates',
      'view-controls',
      'stars',
      'atmosphere-day-night'
    ];
    return (
      <div className='fullscreen'>
        <Globe 
          layers={layers}
          latitude={this.state.lat}
          longitude={this.state.lon}
          altitude={this.state.alt} 
        />
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

Key | Value | Description
-------------- | --------------- | --------------
__blue-marble__ | Blue Marble | Blue Marble Next Generation (BMNG)
__blue-marble-landsat__ | Blue Marble and LandSat | BMNG for oceans and seas with LandSat for land masses
__blue-marble-lowres__ | Background | Blue Marble low-resolution background image
__bing-aerial__ | Bing Aerial | Bing aerial imagery from [Bing maps](https://www.bingmapsportal.com/)
__bing-aerial-labels__ | Bing Aerial with Labels | Bing aerial imagery with road and place name labels from [Bing maps](https://www.bingmapsportal.com/)
__bing-roads__ | Bing Roads | Bing roads map from [Bing maps](https://www.bingmapsportal.com/)
__eox-sentinal2__ | EOX Sentinal-2 | Sentinal 2 imagery from [EOX IT Services GmbH](https://maps.eox.at/)
__eox-sentinal2-labels__ | EOX Sentinal-2 with Labels | Sentinal 2 imagery with OpenStreetMap overlay from [EOX IT Services GmbH](https://maps.eox.at/)
__eox-openstreetmap__ | EOX OpenStreetMap | OpenStreetMap from [EOX IT Services GmbH](https://maps.eox.at/)
__usgs-topo__ | USGS Topographic | Topographic base map from the [USGS](https://nationalmap.gov/)
__usgs-imagery-topo__ | USGS Imagery Topographic | Imagery and topographic base map from the [USGS](https://nationalmap.gov/)
__renderables__ | Renderables | A general purpose layer for hosting shapes and markers
__compass__ | Compass | A compass displayed in upper right
__coordinates__ | Coordinates | View coordinates displayed on top or bottom of screen
__view-controls__ | View Controls | View controls displayed in bottom left
__atmosphere-day-night__ | Atmosphere and Day/Night | Atmosphere and day/night effects
__stars__ | Stars | Background star field
__tessellation__ |Tessellation | Shows terrain tessellation

## License

MIT © [Bruce Schubert](https://github.com/emxsys)
