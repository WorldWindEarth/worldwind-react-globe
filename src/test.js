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

/**
 * Mock for WorldWindow.createContext() 
 * @param {canvas} canvasIgnored
 * @returns {}
 */
WorldWind.WorldWindow.prototype.createContext = function (canvasIgnored) {
  let mockCanvas = new HTMLCanvasElement(500, 500);
  let gl = mockCanvas.getContext('webgl');
  return gl;
};

/**
 * Add a canvas to the DOM to satisfy WorldWindow constructor
 */
beforeEach(() => {
  document.body.innerHTML = '<canvas id="test-canvas">Test Canvas</canvas>';
});

/**
 * Basic globe tests
 */
describe('Globe', () => {
  it('is valid', () => {
    const globe = TestRenderer.create(<Globe canvasId="test-canvas" />).root.instance;
    expect(globe.state.isValid).toBeTruthy();
  });

  it('default globe has one layer', () => {
    const globe = TestRenderer.create(<Globe canvasId="test-canvas" />).root.instance;
    expect(globe.getLayers().length).toBe(1);
  });
});

/**
 * Layer management tests
 */
describe('Layers', () => {
  Globe.defaultLayers.forEach(layerKey => {
    it('add "' + layerKey + '"', () => {
      const globe = TestRenderer.create(<Globe canvasId="test-canvas" />).root.instance;

      const layer = globe.addLayer(layerKey);
      
      expect(globe.getLayer(layer.displayName)).toBeInstanceOf(WorldWind.Layer);
      expect(globe.getLayer(layer.uniqueId)).toBeInstanceOf(WorldWind.Layer);
    });
  });
});

/**
 * Navigation and moving the camera
 */
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

