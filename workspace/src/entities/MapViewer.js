/**
 * Import ol classes
 */
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import Stamen from 'ol/source/Stamen.js';

import LayerSwitcher from '../../static/js/ol-layerswitcher.js';
import Sidebar from '../../static/js/sidebar.js';

export class MapViewer{

    constructor(){

        this.map =  this.initMapWithSideBar(this.base);

        this.layersDict = {};
        this.layersArrya = [];
    }

    initMapWithSideBar(){

        var base = new TileLayer({
            visible: false,
            title: 'Mapbox geojson',
            source: new Stamen({
                layer: 'toner-background'
            })
        });

        var base2 = new TileLayer({
            visible: false,
            title: 'Mapbox geojson',
            source: new Stamen({
                layer: 'watercolor'
            })
        });

        var map = new Map({
            target: 'map',
            layers: [
                base,
                base2
            ],
            view: new View({
                center: [0, 0],
                zoom: 0,
                maxZoom: 28,
                minZoom: 3,
            }),
        });

        var sidebar = new Sidebar({ element: 'sidebar', position: 'left' });
        var toc = document.getElementById('layers');
        LayerSwitcher.renderPanel(map, toc);
        map.addControl(sidebar);
        
        return map;
    }
}
