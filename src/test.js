/* 
 * Copyright (c) 2018 Bruce Schubert.
 * The MIT License
 * http://www.opensource.org/licenses/mit-license
 */
import React, {Component} from 'react';
import TestRenderer from 'react-test-renderer';
import Globe from './components/Globe';
import 'webgl-mock';
/* global WorldWind, expect */

// Replace the WorldWindow.createContext() function with a mocked webgl context
WorldWind.WorldWindow.prototype.createContext = function (canvasIgnored) {
  let mockCanvas = new HTMLCanvasElement(500, 500);
  let gl = mockCanvas.getContext('webgl');
  return gl;
};

// Before each test, add a canvas to the DOM to satisfy the WorldWindow constructor
beforeEach(() => {
  document.body.innerHTML = '<canvas id="test-canvas">Test Canvas</canvas>';
});

describe('Basic Globe', () => {
  it('is valid', () => {
    const globe = TestRenderer.create(<Globe canvasId="test-canvas" />).root.instance;
    expect(globe.state.isValid).toBeTruthy();
  });

  it('default globe has one layer', () => {
    const globe = TestRenderer.create(<Globe canvasId="test-canvas" />).root.instance;
    expect(globe.getLayers().length).toBe(1);
  });
});


describe('Layers', () => {

  Globe.layerTypes.forEach((value, key, map) => {
    // Create layers by layer type keys
    it('add "' + key + '" (key)', () => {
      const globe = TestRenderer.create(<Globe canvasId="test-canvas" />).root.instance;
      const layer = globe.addLayer(key);
      expect(globe.getLayer(layer.displayName)).toBeInstanceOf(WorldWind.Layer);
      expect(globe.getLayer(layer.uniqueId)).toBeInstanceOf(WorldWind.Layer);
    });
  });

  Globe.layerTypes.forEach((value, key, map) => {
    // Create layers by layer type names
    it('add "' + value + '" (name)', () => {
      const globe = TestRenderer.create(<Globe canvasId="test-canvas" />).root.instance;
      const layer = globe.addLayer(value);
      expect(globe.getLayer(layer.displayName)).toBeInstanceOf(WorldWind.Layer);
      expect(globe.getLayer(layer.uniqueId)).toBeInstanceOf(WorldWind.Layer);
    });
  });

  it('add all layers individually to a Globe', () => {
    const globe = TestRenderer.create(<Globe canvasId="test-canvas" />).root.instance;
    let keys = Array.from(Globe.layerTypes.keys());
    keys.forEach((key) => {
      const layer = globe.addLayer(key);
    });
    expect(globe.getLayers().length).toBe(keys.length + 1);
  });

  it('add all layers to a Globe via props.layers (keys)', () => {
    let layers = Array.from(Globe.layerTypes.keys());
    const globe = TestRenderer.create(<Globe canvasId="test-canvas" layers={layers} />).root.instance;
    expect(globe.getLayers().length).toBe(layers.length + 1);
  });

  it('add all layers to a Globe via props.layers (names)', () => {
    let layers = Array.from(Globe.layerTypes.values());
    const globe = TestRenderer.create(<Globe canvasId="test-canvas" layers={layers} />).root.instance;
    expect(globe.getLayers().length).toBe(layers.length + 1);
  });
});


describe('Layers Categories', () => {

  Array.from(Globe.categories.keys()).forEach((category) => {
    let layers = [{layer: 'blue-marble', options: {category: category}}];
    it('add layer to ' + category + ' (key)', () => {
      const globe = TestRenderer.create(<Globe canvasId="test-canvas" layers={layers} />).root.instance;
      expect(globe.getLayers(category).length).toBeTruthy();
    });
  });
  
  Globe.categories.forEach((category) => {
    let layers = [{layer: 'blue-marble', options: {category: category}}];
    it('add layer to ' + category + ' (name)', () => {
      const globe = TestRenderer.create(<Globe canvasId="test-canvas" layers={layers} />).root.instance;
      expect(globe.getLayers(category).length).toBeTruthy();
    });
  });
});


describe('Navigation', () => {

  it('lookAt OXR airport', () => {
    const LAT = 34.2;
    const LON = -119.2;
    const ALT = 50000;
    const globe = TestRenderer.create(
        <Globe 
            canvasId="test-canvas" 
            latitude={LAT}
            longitude={LON}
            altitude={ALT}/>
        ).root.instance;

    let lookAtLocation = globe.wwd.navigator.lookAtLocation;
    let altitude = globe.wwd.navigator.range;

    expect(lookAtLocation.latitude).toBe(LAT);
    expect(lookAtLocation.longitude).toBe(LON);
    expect(altitude).toBe(ALT);
  });

});

