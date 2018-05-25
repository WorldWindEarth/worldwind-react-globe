/* 
 * Copyright (c) 2018 Bruce Schubert.
 * The MIT License
 * http://www.opensource.org/licenses/mit-license
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import '@nasaworldwind/worldwind';

import WorldWindFixes from '../api/WorldWindFixes';
import EoxOpenStreetMapLayer from '../api/EoxOpenStreetMapLayer';
import EoxSentinal2CloudlessLayer from '../api/EoxSentinal2CloudlessLayer';
import EoxSentinal2WithLabelsLayer from '../api/EoxSentinal2WithLabelsLayer';
import EnhancedAtmosphereLayer from '../api/EnhancedAtmosphereLayer';

import styles from './Globe.css'

    /* global WorldWind */

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

    // Define the default path to WorldWind images folder.
    if (!Globe.isBaseUrlSet) {
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
     * The id of an existing canvas to attach the Globe 
     */
    canvasId: PropTypes.string,
    /** 
     * A callback function to push state up to the parent 
     */
    onUpdate: PropTypes.func
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
  ]

  static defaultLayers = [
    "Blue Marble",
    "Blue Marble and LandSat",
    "Bing Aerial",
    "Bing Aerial with Labels",
    "Bing Roads",
    "EOX Sentinal2",
    "EOX Sentinal2 with Labels",
    "EOX OpenStreetMap",
    "Compass",
    "Coordinates",
    "View Controls",
    "Atmosphere and Day/Night",
    "Stars",
    "Tessellation"
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
   * Returns a new array of layers within the given category.
   * @param {String} category E.g., "base", "overlay" or "setting".
   * @returns {Array}
   */
  getLayers(category) {
    if (category) {
      return this.wwd.layers.filter(layer => layer.category === category);
    } else {
      return this.wwd.layers;
    }
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
   * Add a layer to the globe and applies options object properties to the 
   * the layer.
   * @param {WorldWind.Layer|String|Number} layer
   * @param {Object|null} options E.g., {category: "base", enabled: true}
   * @returns {WorldWind.Layer}
   */
  addLayer(layer, options) {
    if (typeof layer === 'number') {
      // Transform layer index into a layer string identifier
      layer = Globe.defaultLayers[layer];
    }
    if (typeof layer === 'string') {
      // Ensure layer name is a value contained in the layers array
      const name = Globe.defaultLayers.find(name => name.includes(layer));
      if (name === 'undefined') {
        console.error("Globe.addLayer: '" + layer + "' is not a valid layer name");
        return null;
      }
      // Create the WorldWind.Layer object cooresponding to the name
      if (name === "Blue Marble") {
        layer = new WorldWind.BMNGLayer();
      } else if (name === "Blue Marble and LandSat") {
        layer = new WorldWind.BMNGLandsatLayer();
      } else if (name === "Bing Aerial") {
        layer = new WorldWind.BingAerialLayer();
      } else if (name === "Bing Aerial with Labels") {
        layer = new WorldWind.BingAerialWithLabelsLayer();
      } else if (name === "Bing Roads") {
        layer = new WorldWind.BingRoadsLayer();
      } else if (name === "EOX Sentinal2") {
        layer = new EoxSentinal2CloudlessLayer();
      } else if (name === "EOX Sentinal2 with Labels") {
        layer = new EoxSentinal2WithLabelsLayer();
      } else if (name === "EOX OpenStreetMap") {
        layer = new EoxOpenStreetMapLayer();
      } else if (name === "Compass") {
        layer = new WorldWind.CompassLayer();
      } else if (name === "Coordinates") {
        layer = new WorldWind.CoordinatesDisplayLayer(this.wwd);
      } else if (name === "View Controls") {
        layer = new WorldWind.ViewControlsLayer(this.wwd);
      } else if (name === "Atmosphere and Day/Night") {
        layer = new EnhancedAtmosphereLayer();
      } else if (name === "Stars") {
        layer = new WorldWind.StarFieldLayer();
      } else if (name === "Tessellation") {
        layer = new WorldWind.ShowTessellationLayer();
      } else {
        console.error("Globe.addLayer() layer name not found: " + name);
      }
    }

    // Copy all properties defined on the options object to the layer
    if (options) {
      for (let prop in options) {
        if (!options.hasOwnProperty(prop)) {
          continue; // skip inherited props
        }
        layer[prop] = options[prop];
      }
    }
    // Assign a default category property for layer management 
    if (typeof layer.category === 'undefined') {
      layer.category = 'overlay'; // default category
    }
    // Assign a unique layer ID for layer management 
    layer.uniqueId = this.nextLayerId++;

    // Add the layer to the globe
    this.wwd.addLayer(layer);
    this.wwd.redraw();

    // Signal a change in the category
    this.updateCategoryTimestamp(layer.category);

    this.publishUpdate(layer.category);
    return layer;
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

//    /**
//     * Returns an observable containing the last update timestamp for the category.
//     * @param {String} category
//     * @returns {Observable} 
//     */
//    getCategoryTimestamp(category) {
//        if (!this.categoryTimestamps.has(category)) {
//            this.categoryTimestamps.set(category, observable.box(Date.now()));
//        }
//        return this.categoryTimestamps.get(category);
//    }

  /**
   * Updates the timestamp for the given category.
   * @param {String} category
   */
  updateCategoryTimestamp(category) {
//        let timestamp = this.getCategoryTimestamp(category);
//        timestamp.set(Date.now());  // observable
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
   * Centers the globe on given location using animation to move from the current location.
   */
  goTo(latitude, longitude, altitude) {
    const position = new WorldWind.Position(latitude, longitude, altitude);
    this.wwd.goTo(position);
  }

  /**
   * Centers the globe on the given location without animation.
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

  activateClickDrop(dropCallback) {
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
   * Applies applicable property changes to the globe.
   */
  shouldComponentUpdate(nextProps, nextState) {
    let shouldRerender = false;
    
    if (nextProps.latitude !== this.props.latitude ||
        nextProps.longitude !== this.props.longitude ||
        nextProps.altitude !== this.props.altitude) {
      this.goTo(nextProps.latitude, nextProps.longitude, nextProps.altitude);
    }
    // TODO: handle changes in the layers
    
    return shouldRerender;
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
    this.addLayer(new WorldWind.BMNGOneImageLayer(), {
      category: "background",
      enabled: true,
      minActiveAltitude: 0}   // override the default value of 3e6;
    );

    // Add any supplied layer configurations to the globe
    if (this.props.layers) {
      this.props.layers.forEach(config =>
      {
        switch (typeof config) {
          case 'string':
          case 'number':
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
    // Use an existing canvas if provided
    if (this.props.canvasId) {
      return null;
    }
    // Otherwise create a canvas for the WorldWindow
    const canvasStyle = {
      cursor: (this.state.isDropArmed ? 'crosshair' : 'default')
//      backgroundColor: 'rgb(36,74,101)',
    };
    return(
        <canvas id={this.canvasId} className={styles.canvasGlobe} style={canvasStyle}>
            Your browser does not support HTML5 Canvas.
        </canvas>
        );
  }
};

