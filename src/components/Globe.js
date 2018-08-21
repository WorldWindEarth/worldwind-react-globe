/* 
 * Copyright (c) 2018 Bruce Schubert.
 * The MIT License
 * http://www.opensource.org/licenses/mit-license
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import 'worldwindjs'; // WorldWind
import { observable } from "mobx";
 
import WorldWindFixes from '../api/WorldWindFixes';
import EoxOpenStreetMapLayer from '../api/EoxOpenStreetMapLayer';
import EoxSentinal2CloudlessLayer from '../api/EoxSentinal2CloudlessLayer';
import EoxSentinal2WithLabelsLayer from '../api/EoxSentinal2WithLabelsLayer';
import EnhancedAtmosphereLayer from '../api/EnhancedAtmosphereLayer';
import UsgsTopoBaseMapLayer from '../api/UsgsTopoBaseMapLayer';
import UsgsImageryTopoBaseMapLayer from '../api/UsgsImageryTopoBaseMapLayer';
import styles from './Globe.css';

/* global WorldWind */

const DEFAULT_BACKGROUND_COLOR = 'rgb(36,74,101)';

/**
 * Globe React component.
 */
export default class Globe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isValid: false,
      isDropArmed: false
    };

    // Apply post-release fixes to the WorldWind library before creating a WorldWindow
    WorldWindFixes.applyLibraryFixes();

    // Skip if the base URL was already set by the application
    if (!Globe.isBaseUrlSet) {
      // Define the default path to the images folder used by WorldWind.
      Globe.setBaseUrl('https://files.worldwind.arc.nasa.gov/artifactory/web/0.9.0/');
    }

    // The WorldWindow
    this.wwd = null;
    this.canvasId = this.props.canvasId || 'canvas_' + Date.now();

    // Layer managment support
    this.nextLayerId = 1;
    this.categoryTimestamps = new Map();

    // Projection support
    this.roundGlobe = null;
    this.flatGlobe = null;

    // Click/Drop support
    this.dropCallback = null;

  }

  static propTypes = {
    /** 
     * An array of layer type strings, WorldWind.Layer objects, and/or layer
     * configuration objects, e.g., {layer: String|WorldWind.Layer, options: Object}
     */
    layers: PropTypes.array,
    /**
     * Latitude +/-90 degrees
     */
    latitude: PropTypes.number,
    /**
     * Longitude +/-180 degrees
     */
    longitude: PropTypes.number,
    /**
     * Altitude in meters above sea level (MSL)
     */
    altitude: PropTypes.number,
    /** 
     * A projection identifier string 
     */
    projection: PropTypes.string,
    /**
     * Background color CSS string
     */
    backgroundColor: PropTypes.string,
    /** 
     * The id of an existing canvas to attach the Globe 
     */
    canvasId: PropTypes.string,
    /** 
     * A callback function to push state up to the parent 
     */
    onUpdate: PropTypes.func
  }

  static get categories() {
    if (!Globe._categories) {
      Globe._categories = new Map();
      Globe._categories.set('background', 'Background');
      Globe._categories.set('base', 'Base Layers');
      Globe._categories.set('overlay', 'Overlays');
      Globe._categories.set('data', 'Data');
      Globe._categories.set('setting', 'Settings');
      Globe._categories.set('debug', 'Debugging');
    }
    return Globe._categories;
  }

  /**
   * Predefined layer types used by addLayer(). An application is free to change 
   * the values but not the keys. The values are used for the default 
   * layer display names.
   */
  static get layerTypes() {
    if (!Globe._layerTypes) {
      Globe._layerTypes = new Map();
      Globe._layerTypes.set('blue-marble', 'Blue Marble');
      Globe._layerTypes.set('blue-marble-lowres', 'Background');
      Globe._layerTypes.set('blue-marble-landsat', 'Blue Marble and LandSat');
      Globe._layerTypes.set('bing-aerial', 'Bing Aerial');
      Globe._layerTypes.set('bing-aerial-labels', 'Bing Aerial with Labels');
      Globe._layerTypes.set('bing-roads', 'Bing Roads');
      Globe._layerTypes.set('eox-sentinal2', 'EOX Sentinal-2');
      Globe._layerTypes.set('eox-sentinal2-labels', 'EOX Sentinal-2 with Labels');
      Globe._layerTypes.set('eox-openstreetmap', 'EOX OpenStreetMap');
      Globe._layerTypes.set('usgs-topo', 'USGS Topographic');
      Globe._layerTypes.set('usgs-imagery-topo', 'USGS Imagery Topographic');
      Globe._layerTypes.set('renderables', 'Renderables');
      Globe._layerTypes.set('compass', 'Compass');
      Globe._layerTypes.set('coordinates', 'Coordinates');
      Globe._layerTypes.set('view-controls', 'View Controls');
      Globe._layerTypes.set('atmosphere-day-night', 'Atmosphere and Day/Night');
      Globe._layerTypes.set('stars', 'Stars');
      Globe._layerTypes.set('tessellation', 'Tessellation');
    }
    return Globe._layerTypes;
  }

  static projections = [
    "3D",
    "Equirectangular",
    "Mercator",
    "North Polar",
    "South Polar",
    "North UPS",
    "South UPS",
    "North Gnomonic",
    "South Gnomonic"
  ];

  /**
   * Specify the location of the WorldWind images folder.
   * E.g., 'https://files.worldwind.arc.nasa.gov/artifactory/web/0.9.0/'
   */
  static setBaseUrl(baseUrl) {
    WorldWind.configuration.baseUrl = baseUrl;
    Globe.isBaseUrlSet = true;
  }
  static isBaseUrlSet = false;

  /**
   * Add a layer to the globe and applies options object properties to the 
   * the layer.
   * @param {WorldWind.Layer|String} layer A layer object or a Globe.layerTypes key or value
   * @param {Object|null} options E.g., {category: "base", enabled: true}
   * @returns {WorldWind.Layer}
   */
  addLayer(layer, options) {
    let wwLayer = null;

    if (typeof layer === 'string') {
      wwLayer = this.createLayer(layer);
    } else if (layer instanceof WorldWind.Layer) {
      wwLayer = layer;
    } else {
      throw new Error("addLayer 'layer' argument must be a String or a WorldWind.Layer")
    }

    // Copy all properties defined on the 'options' object to the layer
    if (options) {
      for (let prop in options) {
        if (!options.hasOwnProperty(prop)) {
          continue; // skip inherited props
        }
        wwLayer[prop] = options[prop];
      }
    }

    // Assign a default category property for layer management 
    if (typeof wwLayer.category === 'undefined') {
      wwLayer.category = 'base'; // default category
    }
    if (!Globe.categories.has(wwLayer.category)) {
      let found = false;
      for (let [key, value] of Globe.categories.entries()) {
        if (found = value.includes(wwLayer.category)) {
          wwLayer.category = key;
          break;
        }
      }
      if (!found) {
        throw new Error("addLayer: 'category " + wwLayer.category + "' is not a valid Globe.categories key");
      }
    }

    // Assign a unique layer ID for layer management 
    wwLayer.uniqueId = this.nextLayerId++;

    // Add the layer to the end of the layers within the category
    let index = 0;
    for (let category of Globe.categories.keys()) {
      index += this.getLayers(category).length;
      if (category === wwLayer.category) {
        this.wwd.insertLayer(index, wwLayer);
        break;
      }
    }
    this.wwd.redraw();

    // Signal a change in the category
    this.updateCategoryTimestamp(wwLayer.category);

    this.publishUpdate(wwLayer.category);
    return wwLayer;
  }

  /**
   * Creates a layer based on a layerType key or value. Layer type keys must be 
   * an exact match; partial strings may be used for layer type values. 
   * @param {String} layerType A Globe.layerTypes key or value
   * @returns {WorldWind.Layer|null}  
   */
  createLayer(layerType) {
    let type = null;

    if (Globe.layerTypes.has(layerType)) {
      // layerType is a key
      type = layerType;
    } else {
      // Look for a layer type value that matches the name in full or part
      let findType = (name) => {
        for (let [key, value] of Globe.layerTypes.entries()) {
          if (value.includes(name)) {
            return key;
          }
        }
      };
      type = findType(layerType);
    }
    // Create the WorldWind.Layer object cooresponding to the layerType
    let layer = null;
    switch (type) {
      case 'blue-marble':
        layer = new WorldWind.BMNGLayer();
        break;
      case 'blue-marble-lowres':
        layer = new WorldWind.BMNGOneImageLayer();
        layer.minActiveAltitude = 0;   // override the default value of 3e6;
        break;
      case 'blue-marble-landsat':
        layer = new WorldWind.BMNGLandsatLayer();
        break;
      case 'bing-aerial':
        layer = new WorldWind.BingAerialLayer();
        layer.detailControl = 1.25;
        break;
      case 'bing-aerial-labels':
        layer = new WorldWind.BingAerialWithLabelsLayer();
        layer.detailControl = 1.25;
        break;
      case 'bing-roads':
        layer = new WorldWind.BingRoadsLayer();
        layer.detailControl = 1.25;
        break;
      case 'eox-sentinal2':
        layer = new EoxSentinal2CloudlessLayer();
        break;
      case 'eox-sentinal2-labels':
        layer = new EoxSentinal2WithLabelsLayer();
        break;
      case 'eox-openstreetmap':
        layer = new EoxOpenStreetMapLayer();
        break;
      case 'usgs-topo':
        layer = new UsgsTopoBaseMapLayer();
        layer.detailControl = 1.75;
        break;
      case 'usgs-imagery-topo':
        layer = new UsgsImageryTopoBaseMapLayer();
        layer.detailControl = 1.75;
        break;
      case 'renderables':
        layer = new WorldWind.RenderableLayer();
        break;
      case 'compass':
        layer = new WorldWind.CompassLayer();
        break;
      case 'coordinates':
        layer = new WorldWind.CoordinatesDisplayLayer(this.wwd);
        break;
      case 'view-controls':
        layer = new WorldWind.ViewControlsLayer(this.wwd);
        // Override the default placement to allow room for credits 
        layer.placement = new WorldWind.Offset(WorldWind.OFFSET_PIXELS, 11, WorldWind.OFFSET_PIXELS, 11);
        layer.showPanControl = false;
        layer.showHeadingControl = true;
        layer.showTiltControl = true;
        layer.showZoomControl = true;
        layer.showExaggerationControl = true;
        layer.showFieldOfViewControl = false;
        break;
      case 'atmosphere-day-night':
        layer = new EnhancedAtmosphereLayer();
        break;
      case 'stars':
        layer = new WorldWind.StarFieldLayer();
        break;
      case 'tessellation':
        layer = new WorldWind.ShowTessellationLayer();
        break;
      default:
        console.error("Globe.createLayer('" + layerType + "'): layer type does not match an entry in Globe.layerTypes");
        return null;
    }
    layer.displayName = Globe.layerTypes.get(type);
    return layer;
  }

  /**
   * Returns the first layer with the given name or the layer with the given id.
   * @param {String|Number} nameOrId Layer name string or unique layer id number
   * @returns {WorldWind.Layer|null}
   */
  getLayer(nameOrId) {
    let layers = null;
    if (typeof nameOrId === 'string') {
      layers = this.wwd.layers.filter(layer => layer.displayName === nameOrId);
    } else {
      layers = this.wwd.layers.filter(layer => layer.uniqueId === nameOrId);
    }
    return layers.length > 0 ? layers[0] : null;
  }

  /**
   * Returns a new array of layers within the given category.
   * @param {String} category A category key, e.g., "base", "overlay", etc.
   * @returns {Array}
   */
  getLayers(category) {
    if (category) {
      if (!Globe.categories.has(category)) {
        for (let [key, value] of Globe.categories.entries()) {
          if (value.includes(category)) {
            category = key;
            break;
          }
        }
      }
      return this.wwd.layers.filter(layer => layer.category === category);
    } else {
      return this.wwd.layers;
    }
  }

  /**
   * Toggles the enabled state of the given layer and updates the layer
   * catetory timestamp. Applies a rule to the 'base' layers the ensures
   * at max Ïonly one base layer is enabled.
   * @param {WorldWind.Layer} layer
   */
  toggleLayer(layer) {
    // Apply rule: only [0..1] "base" layers can be enabled at a time
    if (layer.category === 'base') {
      this.wwd.layers.forEach(function (item) {
        if (item.category === 'base' && item !== layer) {
          item.enabled = false;
        }
      });
    }
    // Toggle the selected layer's visibility
    layer.enabled = !layer.enabled;
    // Trigger a redraw so the globe shows the new layer state ASAP
    this.wwd.redraw();
    // Signal a change in the category
    this.updateCategoryTimestamp(layer.category);

    this.publishUpdate(layer.category);
  }

    /**
     * Returns an observable containing the last update timestamp for the category.
     * @param {String} category
     * @returns {Observable} 
     */
    getCategoryTimestamp(category) {
        if (!this.categoryTimestamps.has(category)) {
            this.categoryTimestamps.set(category, observable.box(Date.now()));
        }
        return this.categoryTimestamps.get(category);
    }

  /**
   * Updates the timestamp for the given category.
   * @param {String} category
   */
  updateCategoryTimestamp(category) {
        let timestamp = this.getCategoryTimestamp(category);
        timestamp.set(Date.now());  // observable
  }

  publishUpdate(category) {
    if (this.props.onUpdate) {
      // Lift-up the layer category state to the parent via a props function
      let key = category + "Layers";
      let state = {layers: this.getLayers(category), lastUpdated: Date.now()};
      let data = {};
      data[key] = state;
      // Update the parent's state via the props function callback
      this.props.onUpdate(data);
    }
  }

  /**
   * Centers the globe on given location and viewed from the given altitude,
   * using animation to move from the current location.
   */
  goTo(latitude, longitude, altitude) {
    const position = new WorldWind.Position(latitude, longitude, altitude);
    this.wwd.goTo(position);
  }

  /**
   * Centers the globe on the given location and viewed from the given altitude (without animation).
   */
  lookAt(latitude, longitude, altitude) {
    if (typeof latitude === 'number') {
      this.wwd.navigator.lookAtLocation.latitude = latitude;
    }
    if (typeof longitude === 'number') {
      this.wwd.navigator.lookAtLocation.longitude = longitude;
    }
    if (typeof altitude === 'number') {
      this.wwd.navigator.range = altitude;
    }
    this.wwd.redraw();
  }

  /**
   * Arms the click-drop handler with the given callback. The callback will be invoked with the 
   * terrain position where the globe is next clicked or tapped.
   */
  armClickDrop(dropCallback) {
    this.dropCallback = dropCallback;
    this.setState({isDropArmed: true});
  }

  /**
   * Handles a click on the WorldWindow. If a "drop" action callback has been
   * defined, it invokes the function with the picked location.
   * @param {Object} event
   */
  handleGlobeClick(event) {
    if (!this.state.isDropArmed) {
      return;
    }
    // Get the clicked window coords
    let type = event.type, x, y;
    switch (type) {
      case 'click':
        x = event.clientX;
        y = event.clientY;
        break;
      case 'touchend':
        if (!event.changedTouches[0]) {
          return;
        }
        x = event.changedTouches[0].clientX;
        y = event.changedTouches[0].clientY;
        break;
      default:
    }
    if (this.dropCallback) {
      // Get all the picked items 
      const pickList = this.wwd.pickTerrain(this.wwd.canvasCoordinates(x, y));
      // Terrain should be one of the items if the globe was clicked
      const terrain = pickList.terrainObject();
      if (terrain) {
        this.dropCallback(terrain.position);
      }
    }
    this.setState({isDropArmed: false});
    event.stopImmediatePropagation();
  }

  /**
   * Switches between a 3D round globe and 2D flat globe projections.
   * @param {String|Number} projection A projections[] string or index
   */
  changeProjection(projection) {
    const proj = (typeof projection === 'number' ? Globe.projections[projection] : projection);

    if (proj === "3D") {
      if (!this.roundGlobe) {
        this.roundGlobe = new WorldWind.Globe(new WorldWind.EarthElevationModel());
      }
      // Replace the flat globe
      if (this.wwd.globe !== this.roundGlobe) {
        this.wwd.globe = this.roundGlobe;
      }
    } else {
      if (!this.flatGlobe) {
        this.flatGlobe = new WorldWind.Globe2D();
      }
      // Create the projection used by the flat globe
      if (proj === "EQUIRECTANGULAR") {
        this.flatGlobe.projection = new WorldWind.ProjectionEquirectangular();
      } else if (proj === "MERCATOR") {
        this.flatGlobe.projection = new WorldWind.ProjectionMercator();
      } else if (proj === "NORTH POLAR") {
        this.flatGlobe.projection = new WorldWind.ProjectionPolarEquidistant("North");
      } else if (proj === "SOUTH POLAr") {
        this.flatGlobe.projection = new WorldWind.ProjectionPolarEquidistant("South");
      } else if (proj === "NORTH UPS") {
        this.flatGlobe.projection = new WorldWind.ProjectionUPS("North");
      } else if (proj === "SOUTH UPS") {
        this.flatGlobe.projection = new WorldWind.ProjectionUPS("South");
      } else if (proj === "NORTH GNOMONIC") {
        this.flatGlobe.projection = new WorldWind.ProjectionGnomonic("North");
      } else if (proj === "SOUTH GNOMONIC") {
        this.flatGlobe.projection = new WorldWind.ProjectionGnomonic("South");
      }
      // Replace the 3D globe
      if (this.wwd.globe !== this.flatGlobe) {
        this.wwd.globe = this.flatGlobe;
      }
    }
  }

  /**
   * Applies applicable property changes to the globe.
   */
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.latitude !== this.props.latitude ||
      nextProps.longitude !== this.props.longitude ||
      nextProps.altitude !== this.props.altitude) {
      this.goTo(nextProps.latitude, nextProps.longitude, nextProps.altitude);
    }
    // TODO: handle changes in the layers

    return true;
  }

  /**
   * Creates the WorldWindow after mounting.
   */
  componentDidMount() {
    // Create the WorldWindow using the ID of the canvas
    this.wwd = new WorldWind.WorldWindow(this.canvasId);

    // Apply post-release fixes to the WorldWindow
    WorldWindFixes.applyWorldWindowFixes(this.wwd);

    // Apply projection support
    this.roundGlobe = this.wwd.globe;
    if (this.props.projection) {
      this.changeProjection(this.props.projection);
    }

    // Added click/pick handler support
    this.wwd.addEventListener('click', (e) => this.handleGlobeClick(e));
    this.wwd.addEventListener('touchend', (e) => this.handleGlobeClick(e));

    // Add a low-res background layer that's always available
    this.addLayer('blue-marble-lowres', {category: "background"});  // this should be a setting

    // Add any supplied layer configurations to the globe
    if (this.props.layers) {
      this.props.layers.forEach(config =>
      {
        switch (typeof config) {
          case 'string':
            this.addLayer(config);
            break;
          case 'object':
            if (config instanceof WorldWind.Layer) {
              this.addLayer(config);
            } else {
              this.addLayer(config.layer, config.options);
            }
            break;
        }
      });
    }

    // Change the startup position if given 
    if (this.props.latitude && this.props.longitude) {
      this.lookAt(this.props.latitude, this.props.longitude, this.props.altitude)
    }

    // Update state
    this.setState({isValid: true});
  }

  render() {
    let cursor = (this.state.isDropArmed ? 'crosshair' : 'default');
    let backgroundColor = (this.props.backgroundColor || DEFAULT_BACKGROUND_COLOR); // this should use a defaultProps

    // Apply changes to an existing canvas
    if (this.props.canvasId) {
      let canvas = document.getElementById(this.props.canvasId);
      if (canvas) {
        canvas.style.cursor = cursor;
        canvas.style.backgroundColor = backgroundColor;
      }
      // Don't render this component's canvas if an existing canvas element is being used
      return null;
    }

    // Otherwise create a canvas for the WorldWindow
    let style = {
      width: '100%',
      height: '100%',
      cursor: cursor,
      backgroundColor: backgroundColor
    };

    return(
      <canvas id={this.canvasId} style={style}>
          Your browser does not support HTML5 Canvas.
      </canvas>
      );
  }
};

