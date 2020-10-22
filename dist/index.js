"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorldMap = exports.createTerrainMap = void 0;
const leaflet = require("leaflet");
require("leaflet.tilelayer.fallback");
const debug_1 = require("./debug");
const createMap = ({ container, mapUrl, attribution, tileLayerOptions, mapOptions }) => {
    const state = { debug: false };
    const map = leaflet.map(container, mapOptions).setView([0, 0], 1);
    map.attributionControl.setPrefix('');
    const layerOptions = Object.assign({ minZoom: 0, maxZoom: 9, attribution }, tileLayerOptions);
    leaflet.tileLayer.fallback(mapUrl, layerOptions).addTo(map);
    map.addEventListener('keypress', (event) => {
        const keyboardEvent = event.originalEvent;
        if (keyboardEvent.shiftKey && keyboardEvent.key === 'D') {
            if (state.debug) {
                state.debug = false;
                debug_1.removeDebugLayer(map);
            }
            else {
                state.debug = true;
                debug_1.addDebugLayer(map);
            }
        }
    });
    return map;
};
const createWorldMap = (worldMapOptions) => {
    const map = createMap(Object.assign({}, worldMapOptions));
    leaflet.control.scale({ imperial: false }).addTo(map);
    return map;
};
exports.createWorldMap = createWorldMap;
const createTerrainMap = (terrainMapOptions) => {
    const tileLayerOptions = {
        minZoom: 1,
        maxZoom: 6,
    };
    // According to Maanmittauslaitos one pixel in highest zoom level of the original files of the terrain map is 2048 meters. (Koko_Suomi/zoom_0/Yleiskarttarasteri_8milj.png)
    // https://www.maanmittauslaitos.fi/kartat-ja-paikkatieto/asiantuntevalle-kayttajalle/tuotekuvaukset/maastokarttasarja-rasteri
    // To make 256x256 tiles and have the image in 2:3 aspect ratio we scale the original image by height (610 -> 768), and fill the missing width with empty space
    // This means we scale the actualy map image 125,901639344% of it's original height (768 ÷ 610 * 100)
    // This makes one pixel in the map 1626,6667 meters (2048 ÷ (768÷610))
    // Then we need tell leaflet how many pixels is one meter in the map (1 ÷ 1626.6667)
    // Then it's divided by two because it applies to zoom level 0 and this calculation was made for zoom level 1 (the images in original material have wrong names)
    // We don't need to calculate this for any other level because leaflet calculates them automatically.
    const scaleFactor = 0.000614754 / 2;
    const customCrs = leaflet.Util.extend({}, leaflet.CRS.Simple, {
        transformation: new leaflet.Transformation(scaleFactor, 0, -scaleFactor, 0),
    });
    const mapOptions = {
        crs: customCrs,
    };
    const map = createMap(Object.assign(Object.assign({}, terrainMapOptions), { tileLayerOptions, mapOptions }));
    const mapWidth = 512;
    const mapHeight = 768;
    const mapCenter = map.latLngToContainerPoint(map.getCenter());
    const centerViewPoint = mapCenter.add(new leaflet.Point(mapWidth / 2, mapHeight / 2));
    map.setView(map.containerPointToLatLng(centerViewPoint), 1, { animate: false });
    leaflet.control.scale({ imperial: false }).addTo(map);
    return map;
};
exports.createTerrainMap = createTerrainMap;
//# sourceMappingURL=index.js.map