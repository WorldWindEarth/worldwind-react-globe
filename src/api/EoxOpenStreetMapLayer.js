/* 
 * Copyright (c) 2018 Bruce Schubert.
 * The MIT License
 * http://www.opensource.org/licenses/mit-license
 */
import WorldWind from '@nasaworldwind/worldwind';

import EnhancedWmsLayer from './EnhancedWmsLayer';

export default class EoxOpenStreetMapLayer extends EnhancedWmsLayer {
    constructor() {
        var cfg = {
            title: "OpenStreetMap by EOX",
            version: "1.3.0",
            service: "https://tiles.maps.eox.at/wms",
            layerNames: "osm",
            sector: new WorldWind.Sector(-90.0, 90.0, -180, 180),
            levelZeroDelta: new WorldWind.Location(180, 180),
            numLevels: 16,
            format: "image/png",
            size: 256,
            coordinateSystem: "EPSG:4326", // optional
            styleNames: "" // (optional): {String} A comma separated list of the styles to include in this layer.</li>
        };
        super(cfg);

        // Make this slightly translucent
        this.opacity = 0.8;

        // Requesting tiles with transparency (the nominal case) causes the layer's labels to bleed 
        // the underlying background layer which makes for a rather ugly map.
        this.urlBuilder.transparent = false;
    }

    doRender(dc) {
        super.doRender(dc);
        if (this.inCurrentFrame) {
            dc.screenCreditController.addStringCredit(
                "OpenStreetMap { Data © OpenStreetMap contributers, Rendering © MapServer and EOX }",
                WorldWind.Color.DARK_GRAY);
        }
    }
}