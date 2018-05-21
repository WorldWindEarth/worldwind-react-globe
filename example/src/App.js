import React, { Component } from 'react'

import Globe from 'worldwind-react-globe'

export default class App extends Component {
    render () {
        const divStyle = {
            width: '100vw',
            height: '100vh'
        };

        return (
            <div style={divStyle}>
                <Globe id="globe-canvas" />
            </div>
        )
    }
}
