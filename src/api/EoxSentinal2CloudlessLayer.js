/* 
 * Copyright (c) 2018 Bruce Schubert.
 * The MIT License
 * http://www.opensource.org/licenses/mit-license
 */
import WorldWind from '@nasaworldwind/worldwind';

import EnhancedWmsLayer from './EnhancedWmsLayer';

export default class EoxSentinal2CloudlessLayer extends EnhancedWmsLayer {
    constructor() {
        let cfg = {
            title: "Sentinel-2 cloudless by EOX",
            version: "1.3.0",
            service: "https://tiles.maps.eox.at/wms",
            layerNames: "s2cloudless",
            sector: new WorldWind.Sector(-90.0, 90.0, -180, 180),
            levelZeroDelta: new WorldWind.Location(180, 180),
            numLevels: 16,
            format: "image/png",
            size: 256,
            coordinateSystem: "EPSG:4326", // optional
            styleNames: "" // (optional): {String} A comma separated list of the styles to include in this layer.</li>
        };
        super(cfg);

        // Make this layer opaque
        this.opacity = 1.0;

        this.urlBuilder.transparent = false;
    }

    doRender(dc) {
        super.doRender(dc);
        if (this.inCurrentFrame) {
            dc.screenCreditController.addStringCredit(
                "Sentinel-2 cloudless by EOX IT Services GmbH",
                WorldWind.Color.LIGHT_GRAY);
        }
    }

}
