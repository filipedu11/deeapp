/**
 * Import ol classes
 */
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import LayerGroup from 'ol/layer/Group';
import Stamen from 'ol/source/Stamen.js';
import XYZ from 'ol/source/XYZ.js';

import LayerSwitcher from '../panels/LayerSwitcher.js';
import Sidebar from '../../static/js/sidebar.js';
import { Progress } from '../../static/js/Progress.js';

import { Layer, LayerEntity } from './LayerEntity';
import { LayerDecode } from '../decode/LayerDecode';

import {Style, Fill, Stroke} from 'ol/style';
import geojsonvt from 'geojson-vt';

import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/VectorTile';
import Vector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/VectorTile';
import Projection from 'ol/proj/Projection';

import { FeaturesDecode } from '../decode/FeaturesDecode';
import { ErrorMatrix } from '../panels/ErrorMatrix.js';
import { Piechart } from '../panels/Piechart.js';

import {getArea, getLength} from 'ol/sphere.js';

import 'jquery';
import 'highcharts/modules/exporting.js';
import 'highcharts/modules/export-data.js';
import 'highcharts/modules/offline-exporting.js';
import { Legend } from '../panels/Legend.js';
import { Controllers } from '../panels/Controllers';

import * as turf from '@turf/turf';

/*eslint no-undef: "error"*/
/*eslint-env node*/
var geojsonRbush = require('geojson-rbush').default;

var BASE_TYPE_STRING = 'basemap';
var CLASSIFICATION_TYPE_STRING = 'classification';
var VALIDATION_STRING = 'validation';
var EVALUATION_STRING = 'evaluation';

export class MapViewer{

    constructor(){

        this.baseDict = {};
        this.baseArray = [];

        this.classiArray = [];
        this.valiArray = [];

        this.allLayersDict = {};
        this.lyrsSelected = [];

        //Create the initial map
        this.map =  this.createInitMap();
        this.errorMatrix = new ErrorMatrix();
        this.piechart = new Piechart();
        this.legend = new Legend();
        this.controllers = new Controllers();

        //Add Sidebar control to map
        this.createSideBar();

        //Create base layers group
        this.initLayersGroup();

        //Add base layers to map
        this.addBaseLayers();

        //Render the layerswitcher
        this.loadLayerSwitcher();

        this.clearStatsPanel();

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
            typeBase: BASE_TYPE_STRING,
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

        var evaluations = new LayerGroup({
            title: 'Evaluations',
            fold: 'open',
            typeBase: EVALUATION_STRING
        });

        this.map.addLayer(base);
        this.map.addLayer(classifications);
        this.map.addLayer(validations);
        this.map.addLayer(evaluations);
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

    setLyrsSelected(lyrsSelected){
        this.lyrsSelected = lyrsSelected;
    }

    createLayerObj(layerGeojson, typeGroup) {
        var cD = new LayerDecode();
        var k = cD.key;

        var id = layerGeojson[cD.layerID[k]];

        var lyr = new LayerEntity(
            id,
            layerGeojson[cD.layerName[k]],
            layerGeojson[cD.layerDescription[k]],
            layerGeojson[cD.layerRasterFile[k]],
            layerGeojson[cD.layerSource[k]],
            layerGeojson[cD.layerStats[k]],
            layerGeojson[cD.layerStyle[k]],
            layerGeojson[cD.features[k]],
            layerGeojson[cD.classNames[k]],
            layerGeojson,
            typeGroup
        );

        this.allLayersDict[id] = lyr;
        this.valiArray.push(lyr);

        return lyr;
    }

    addClassification(classiGeojson){

        var newLayer = this.createLayer(classiGeojson, this.createLayerObj(classiGeojson, CLASSIFICATION_TYPE_STRING));

        this.addLayerToMapGroup(CLASSIFICATION_TYPE_STRING, newLayer);

        this.loadLayerSwitcher();
    }

    addValidation(validationGeojson){

        var newLayer = this.createLayer(validationGeojson, this.createLayerObj(validationGeojson, VALIDATION_STRING));

        this.addLayerToMapGroup(VALIDATION_STRING, newLayer);

        this.loadLayerSwitcher();
    }

    addEvaluation(evaluationGeojson){

        var newLayer = this.createLayer(evaluationGeojson, this.createLayerObj(evaluationGeojson, EVALUATION_STRING));

        this.addLayerToMapGroup(EVALUATION_STRING, newLayer);

        this.loadLayerSwitcher();
    }

    removeEvaluation(evaluationLayer){

        this.map.removeLayer(evaluationLayer);

        this.loadLayerSwitcher();
    }

    createStyle(lyr){

        var classAux = this.getObjectLayer(lyr.get('layerId'));

        var fD = classAux.getDecode().featuresDecode;
        var k = classAux.getDecode().key;

        var inactiveC = lyr.get('inactiveClasses');

        lyr.setStyle(function name(feature, resolution) {

            var colorAux = classAux.getColorOfClass(feature.get(fD.classId[k]));
            
            var areaNumber = document.getElementById('area-number');
            var filterNumber = areaNumber ? areaNumber.value : 0;
            var drawFeature =  filterNumber <= feature.get('areaInHectare');

            if ( !inactiveC[feature.get(fD.classId[k])] && drawFeature ) {
                return [new Style({
                    // stroke: new Stroke({
                    //     color: 'rgba(255,255,255,0)',
                    //     width: 0
                    // }),
                    fill: new Fill({
                        color: colorAux,
                    }),
                })];
            }
        });
    }

    createSource(lyrGeojson){

        var tileIndex = geojsonvt(
            lyrGeojson, {
                tolerance:3,
                maxZoom: this.map.getView().getMaxZoom()
            }
        );

        var replacer = this.replacer;

        return new VectorSource({
            format: new GeoJSON(),
            features: lyrGeojson,
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
            sourceAux: vectorSource,
            inactiveClasses: {}
        });

        this.createStyle(layer);

        return layer;
    }

    createMetadata(lyrId){
        var cl = this.getObjectLayer(lyrId);
        cl.createMetadata();
    }

    clearMetadata(lyrId){
        var cl = this.getObjectLayer(lyrId);
        cl.clearMetadata();
    }

    createLegend(){
        var lenSelectLayer = this.lyrsSelected.length;
        if (lenSelectLayer > 0) this.legend.createLegend(this.getObjectLayer(this.lyrsSelected[lenSelectLayer-1].get('layerId')));
    }

    clearLegend(){
        this.legend.clearLegend();
    }

    getObjectLayer(id){
        return this.allLayersDict[id];
    }

    updateLayersInMap(){

    }

    updateStatsPanel(){

        var lenSelectLayer = this.lyrsSelected.length;

        if (lenSelectLayer > 0) {

            var foundEvalLayers = [];

            for (let index = 0; index < this.lyrsSelected.length; index++) {
                const lyr = this.getObjectLayer(this.lyrsSelected[index].get('layerId'));
                if (lyr.getType() == EVALUATION_STRING) {
                    foundEvalLayers.push(this.lyrsSelected[index]);
                } 
            }

            var layerSel = foundEvalLayers.length > 0 ? foundEvalLayers[foundEvalLayers.length-1] : this.lyrsSelected[lenSelectLayer - 1];

            
            if ( this.currentLayer ) {
                if ( this.currentLayer.get('layerId') != layerSel.get('layerId')) {
                    this.clearStatsPanel();
                }
            }
            var dataLyr = this.getObjectLayer(layerSel.get('layerId'));  

            if (foundEvalLayers.length > 0) {
                this.createConfusionMatrix(layerSel);
                this.createConfusionMatrixFiltered(dataLyr, 0);
            }

            this.createPieChartForArea(layerSel);
            
            if ( !this.controllers.isDisplayed )
                this.createControllerPanel();

            var eMatrixClass = this.errorMatrix;
            var ePieChart = this.piechart;

            var areaNumber = document.getElementById('area-number');
            areaNumber.onchange = function(){
                layerSel.getSource().dispatchEvent('change');
                if (foundEvalLayers.length > 0) {
                    eMatrixClass.createConfusionMatrixFiltered(dataLyr, areaNumber.value);
                }
                ePieChart.createPieChart(layerSel, dataLyr, areaNumber.value);
            };
            this.currentLayer = layerSel;
        }
        else {
            this.controllers.clearControls();
        }
    }

    createPieChartForArea(lyr){
        var dataLyr = this.getObjectLayer(lyr.get('layerId'));
        this.piechart.createPieChart(lyr, dataLyr, 0);
    }   
    
    createConfusionMatrix(lyr){
        var dataLyr = this.getObjectLayer(lyr.get('layerId'));
        this.errorMatrix.createConfusionMatrix(lyr, dataLyr);
    } 

    createConfusionMatrixFiltered(dataLyr, areaToFilter){
        this.errorMatrix.createConfusionMatrixFiltered(dataLyr, areaToFilter);
    }

    createControllerPanel(){
        this.controllers.createControllers();
    }

    clearStatsPanel(){
        this.piechart.clearStatsPanel();
        this.errorMatrix.clearStatsPanel();
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
