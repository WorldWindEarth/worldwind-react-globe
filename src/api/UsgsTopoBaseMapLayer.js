/* 
 * Copyright (c) 2018 Bruce Schubert.
 * The MIT License
 * http://www.opensource.org/licenses/mit-license
 */
import 'worldwindjs'; //WorldWind global

import EnhancedWmsLayer from './EnhancedWmsLayer';

/*global define, WorldWind */

/**
 * The USGS TNM Topo Base Map layer.
 * 
 * See: https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer?request=GetCapabilities&service=WMS
 */
export default class UsgsTopoBaseMapLayer extends EnhancedWmsLayer {
  /**
   * Constructs a USGS Topo map layer.
   * @constructor
   * @augments WmsLayer
   */
  constructor() {
    let cfg = {
      title: "USGS Topo Basemap",
      version: "1.3.0",
      service: "https://basemap.nationalmap.gov:443/arcgis/services/USGSTopo/MapServer/WmsServer?",
      layerNames: "0",
      sector: new WorldWind.Sector(-90.0, 90.0, -180, 180),
      levelZeroDelta: new WorldWind.Location(180, 180),
      numLevels: 15,
      format: "image/png",
      size: 256,
      coordinateSystem: "EPSG:4326", // optional
      styleNames: "" // (optional): {String} A comma separated list of the styles to include in this layer.</li>
    };
    super(cfg);

    // Make this layer opaque
    this.opacity = 1.0;

    // Requesting tiles with transparency (the nominal case) causes the layer's labels to bleed 
    // the underlying background layer which makes for a rather ugly map.
    this.urlBuilder.transparent = false;
  }
}