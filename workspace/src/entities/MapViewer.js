/**
 * Import ol classes
 */
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import LayerGroup from 'ol/layer/Group';
import Stamen from 'ol/source/Stamen.js';
import XYZ from 'ol/source/XYZ.js';

import LayerSwitcher from '../panels/Layer.js';
import Sidebar from '../../static/js/sidebar.js';
import { Progress } from '../../static/js/Progress.js';

import { Classification } from './Classification';
import { ClassificationDecode } from '../decode/ClassificationDecode';
import { StatsClassification } from '../panels/classification/StatsClassification';

import {Style, Fill, Stroke} from 'ol/style';
import geojsonvt from 'geojson-vt';

import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/VectorTile';
import Vector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/VectorTile';
import Projection from 'ol/proj/Projection';

import { FeaturesDecode } from '../decode/FeaturesDecode';

var BASE_TYPE_STRING = 'basemap';
var CLASSIFICATION_TYPE_STRING = 'classification';
var VALIDATION_STRING = 'validation';

export class MapViewer{

    constructor(){

        this.baseDict = {};
        this.baseArray = [];

        this.classiArray = [];

        this.allLayersDict = {};

        //Create the initial map
        this.map =  this.createInitMap();

        //Add Sidebar control to map
        this.createSideBar();

        //Create base layers group
        this.initLayersGroup();

        //Add base layers to map
        this.addBaseLayers();

        //Render the layerswitcher
        this.loadLayerSwitcher();


        this.statsPanel = new StatsClassification();

        this.map.set('mapViewer', this);
    }

    createInitMap(){
        var map = new Map({
            target: 'map',
            view: new View({
                center: [0, 0],
                zoom: 0,
                maxZoom: 24,
                minZoom: 2
            })
        });

        map.set('initExtent', map.getView().getProjection().getExtent());

        return map;
    }

    createSideBar(){
        var sidebar = new Sidebar({ element: 'sidebar', position: 'left' });
        this.map.addControl(sidebar);
    }

    loadLayerSwitcher(){
        var toc = document.getElementById('layers');
        LayerSwitcher.renderPanel(this.map, toc);
    }

    initLayersGroup(){
        var base = new LayerGroup({
            title: 'Base Maps',
            fold: 'open',
            typeBase: BASE_TYPE_STRING
        });

        var classifications = new LayerGroup({
            title: 'Classifications',
            fold: 'open',
            typeBase: CLASSIFICATION_TYPE_STRING
        });
        
        var validations = new LayerGroup({
            title: 'Validations',
            fold: 'open',
            typeBase: VALIDATION_STRING
        });

        this.map.addLayer(base);
        this.map.addLayer(classifications);
        this.map.addLayer(validations);
    }

    addLayerToMapGroup(typeGroup, newLayer){

        this.map.getLayers().forEach(function(layer) {
            if(layer.getLayers && layer.get('typeBase') == typeGroup){
                layer.getLayers().push(newLayer);
            }
        });
    }

    addBaseLayers(){
        
        var base = new TileLayer({
            visible: true,
            title: 'World Map - Dark',
            typeBase: BASE_TYPE_STRING,
            source: new XYZ({ 
                url:'http://{1-4}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
            })
        });

        var base2 = new TileLayer({
            visible: false,
            title: 'World Map - Light',
            typeBase: BASE_TYPE_STRING,
            source: new XYZ({ 
                url:'http://{1-4}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
            })
        });

        this.addProgressStatus(base.getSource());
        this.addProgressStatus(base2.getSource());

        this.baseDict.b1 = base;
        this.baseDict.b2 = base2;
        this.baseArray.push(base, base2);

        this.addLayerToMapGroup(BASE_TYPE_STRING, base);
        this.addLayerToMapGroup(BASE_TYPE_STRING, base2);
    }

    getMap(){
        return this.map;
    }

    addClassification(classiGeojson){

        var cD = new ClassificationDecode();
        var id = classiGeojson[cD.classificationID];

        var classification = new Classification(
            id, 
            classiGeojson[cD.classificationName], 
            classiGeojson[cD.classificationDescription], 
            classiGeojson[cD.classificationRasterFile], 
            classiGeojson[cD.classificationSource], 
            classiGeojson[cD.classificationStats], 
            classiGeojson[cD.classificationStyle],
            classiGeojson[cD.features],
            classiGeojson
        );

        this.allLayersDict[id] = classification;
        this.classiArray.push(classification);

        var layer = this.createLayer(classiGeojson, classification);

        this.addLayerToMapGroup(CLASSIFICATION_TYPE_STRING, layer);

        this.loadLayerSwitcher();
    }

    createStyle(lyr){

        var classAux = this.getObjectLayer(lyr.get('layerId'));

        var fD = new FeaturesDecode();

        var mapAux = this.map;

        lyr.setStyle(function name(feature, resolution) {
           
            var colorAux = classAux.getColorOfClass(feature.get(fD.classId));

            return [new Style({
                // stroke: new Stroke({
                //     color: 'rgba(255,255,255,0)',
                //     width: 0
                // }),
                fill: new Fill({
                    color: colorAux,
                }),
            })];
        });
    }

    createSource(classiGeojson){

        var tileIndex = geojsonvt(
            classiGeojson, {
                tolerance:3,
                maxZoom: this.map.getView().getMaxZoom()
            }
        );

        var replacer = this.replacer;

        return new VectorSource({
            format: new GeoJSON(),
            features: classiGeojson,
            tileLoadFunction: function(tile) {
                var format = tile.getFormat();
                var tileCoord = tile.getTileCoord();
                var data = tileIndex.getTile(tileCoord[0], tileCoord[1], -tileCoord[2] - 1);
                var features = format.readFeatures(
                    JSON.stringify({
                        type: 'FeatureCollection',
                        features: data ? data.features : []
                    }, replacer));
                tile.setLoader(function() {
                    tile.setFeatures(features);
                    tile.setProjection(
                        new Projection({
                            code: 'TILE_PIXELS',
                            units: 'tile-pixels'
                        })
                    );
                });
            },
            url: 'data:' // arbitrary url, we don't use it in the tileLoadFunction
        });

    }

    createLayer(geojsonObject, classObject){

        var source = this.createSource(geojsonObject);

        source = this.addProgressStatus(source);

        var vectorSource = new Vector({
            features: (new GeoJSON()).readFeatures(geojsonObject, {featureProjection: 'EPSG:3857'})
        });

        var layer = new VectorLayer({
            title: classObject.getName(),            
            visible: false,
            source: source,
            layerId: classObject.getId(),
            sourceAux: vectorSource
        });

        this.createStyle(layer);

        return layer;
    }

    createMetadata(classificationId){
        var cl = this.getObjectLayer(classificationId);
        cl.createMetadata();
    }

    clearMetadata(classificationId){
        var cl = this.getObjectLayer(classificationId);
        cl.clearMetadata();
    }

    createLegend(classificationId){
        var cl = this.getObjectLayer(classificationId);
        cl.createLegend();
    }

    clearLegend(classificationId){
        var cl = this.getObjectLayer(classificationId);
        cl.clearLegend();
    }

    createStats(classificationId){
        var cl = this.getObjectLayer(classificationId);
        this.statsPanel.createStatsPanel(cl);
    }

    clearStats(classificationId){
        var cl = this.getObjectLayer(classificationId);
        this.statsPanel.clearStatsPanel(cl);
    }

    getObjectLayer(id){
        return this.allLayersDict[id];
    }

    /**
     * Method that add loading bar to source objects (Source OpenLayers)
     *
     * @param {Object} vSource
     */
    addProgressStatus(vSource){

        const prog = new Progress(document.getElementById('progress'));

        vSource.on('tileloadstart', function() {
            prog.addLoading();
        });
        vSource.on('tileloadend', function() {
            prog.addLoaded();
        });
        vSource.on('tileloaderror', function() {
            prog.addLoaded();
        });

        return vSource;
    }

    //#######################//
    // FOR GEOJSONVT LIBRARY //
    //#######################//

    /**
     * Function for the use of geojsonvt
     *
     * @param {} key
     * @param {*} value
     */
    replacer(key, value) {
        if (value.geometry) {
            var type;
            var rawType = value.type;
            var geometry = value.geometry;

            if (rawType === 1) {
                type = 'MultiPoint';
                if (geometry.length == 1) {
                    type = 'Point';
                    geometry = geometry[0];
                }
            } else if (rawType === 2) {
                type = 'MultiLineString';
                if (geometry.length == 1) {
                    type = 'LineString';
                    geometry = geometry[0];
                }
            } else if (rawType === 3) {
                type = 'Polygon';
                if (geometry.length > 1) {
                    type = 'MultiPolygon';
                    geometry = [geometry];
                }
            }

            return {
                'type': 'Feature',
                'geometry': {
                    'type': type,
                    'coordinates': geometry
                },
                'properties': value.tags
            };
        } else {
            return value;
        }
    }
}
