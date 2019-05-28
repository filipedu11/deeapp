import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { readFileSync } from 'fs';

var classification = readFileSync("./workspace/static/data/classification/classification_example.geojson", "utf8");

console.log(classification);

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
        source: new OSM()
        })
    ],
    view: new View({
        center: [0, 0],
        zoom: 0
    })
});