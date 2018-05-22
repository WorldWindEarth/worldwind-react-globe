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

### Typical Usage

Creates a Globe that fills the page.

- Uses a `ref` object to access the Globe after mounting
- Sets the WorldWind `baseUrl` property prior to use
- After mounting the Globe


```jsx
import React, { Component } from 'react'
import Globe from 'worldwind-react-globe'
import './App.css'

/* global WorldWind */

class App extends Component {
    constructor(props) {
        super(props);
        // A reference to the Globe component after mounting
        this.globeRef = React.createRef();
    }        

    componentDidMount() {
        // Get the Globe component with the WorldWindow (wwd) after mounting
        const globe = this.globeRef.current;
        
        // Define layers to be added to the globe
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
        return (
            <div className="container">
                <Globe ref={this.globeRef}/>
            </div>
        )
    }
}
```

## License

MIT © [Bruce Schubert](https://github.com/emxsys)
