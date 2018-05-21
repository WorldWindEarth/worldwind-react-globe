/* 
 * Copyright (c) 2018 Bruce Schubert.
 * The MIT License
 * http://www.opensource.org/licenses/mit-license
 */
import WorldWind from '@nasaworldwind/worldwind';


export default class EnhancedAtmosphereLayer extends WorldWind.AtmosphereLayer {
    constructor(url) {
        super(url);
        /**
         * The default opacity of the night image.
         */
        this.opacity = 0.7;
        /**
         * Flag to determine if nighttime should be rendered.
         */
        this.nightEnabled = false;
    }

}
