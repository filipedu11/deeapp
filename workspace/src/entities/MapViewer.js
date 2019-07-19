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

import {Style, Fill, Stroke} from 'ol/style';
import geojsonvt from 'geojson-vt';

import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/VectorTile';
import Vector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/VectorTile';
import Projection from 'ol/proj/Projection';

import { FeaturesDecode } from '../decode/FeaturesDecode';
import { Stats } from '../panels/Stats.js';

import 'jquery';
import 'highcharts/modules/exporting.js';
import 'highcharts/modules/export-data.js';
import 'highcharts/modules/offline-exporting.js';

import Highcharts from 'highcharts';
import * as turf from '@turf/turf';

var BASE_TYPE_STRING = 'basemap';
var CLASSIFICATION_TYPE_STRING = 'classification';
var VALIDATION_STRING = 'validation';

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
        this.stats = new Stats();

        //Add Sidebar control to map
        this.createSideBar();

        //Create base layers group
        this.initLayersGroup();

        //Add base layers to map
        this.addBaseLayers();

        //Render the layerswitcher
        this.loadLayerSwitcher();

        this.createEmptyStatsPanel();

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

    setLyrsSelected(lyrsSelected){
        this.lyrsSelected = lyrsSelected;
    }

    addClassification(classiGeojson){

        var cD = new ClassificationDecode();
        var k = cD.key;

        var id = classiGeojson[cD.classificationID[k]];

        var classification = new Classification(
            id,
            classiGeojson[cD.classificationName[k]],
            classiGeojson[cD.classificationDescription[k]],
            classiGeojson[cD.classificationRasterFile[k]],
            classiGeojson[cD.classificationSource[k]],
            classiGeojson[cD.classificationStats[k]],
            classiGeojson[cD.classificationStyle[k]],
            classiGeojson[cD.features[k]],
            classiGeojson[cD.classNames[k]],
            classiGeojson,
            CLASSIFICATION_TYPE_STRING
        );

        this.allLayersDict[id] = classification;
        this.classiArray.push(classification);

        var layer = this.createLayer(classiGeojson, classification);

        this.addLayerToMapGroup(CLASSIFICATION_TYPE_STRING, layer);

        this.loadLayerSwitcher();
    }

    addValidation(classiGeojson){

        var cD = new ClassificationDecode();
        var k = cD.key;

        var id = classiGeojson[cD.classificationID[k]];

        var classification = new Classification(
            id,
            classiGeojson[cD.classificationName[k]],
            classiGeojson[cD.classificationDescription[k]],
            classiGeojson[cD.classificationRasterFile[k]],
            classiGeojson[cD.classificationSource[k]],
            classiGeojson[cD.classificationStats[k]],
            classiGeojson[cD.classificationStyle[k]],
            classiGeojson[cD.features[k]],
            classiGeojson[cD.classNames[k]],
            classiGeojson,
            VALIDATION_STRING
        );

        this.allLayersDict[id] = classification;
        this.valiArray.push(classification);

        var layer = this.createLayer(classiGeojson, classification);

        this.addLayerToMapGroup(VALIDATION_STRING, layer);

        this.loadLayerSwitcher();
    }


    createStyle(lyr){

        var classAux = this.getObjectLayer(lyr.get('layerId'));

        var fD = classAux.getDecode().featuresDecode;
        var k = classAux.getDecode().key;

        var mapAux = this.map;

        lyr.setStyle(function name(feature, resolution) {

            var colorAux = classAux.getColorOfClass(feature.get(fD.classId[k]));

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
            sourceAux: vectorSource,
            inactiveClasses: {}
        });

        layer.set(
            'showHideClass',
            function(lyr, classAux) {

                var inactiveC = lyr.get('inactiveClasses');

                lyr.setStyle(function name(feature, resolution) {

                    var fD = classAux.getDecode().featuresDecode;
                    var k = classAux.getDecode().key;

                    var colorAux = classAux.getColorOfClass(feature.get(fD.classId[k]));

                    if ( !inactiveC[feature.get(fD.classId[k])] ) {
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
        );

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

    getObjectLayer(id){
        return this.allLayersDict[id];
    }

    createEmptyStatsPanel(){
        return this.stats.noneLayerSelected();
    }

    updateStatsPanel(){

        var content = document.getElementById('container-stats');

        content.innerHTML = '';

        if (this.lyrsSelected.length == 1) {
            this.createPieChartForArea(this.lyrsSelected[0]);
        }
        else {
            var foundClassificationLayer = false;
            var foundValidationLayer = false;
            var isEval = false;

            for (let index = 0; index < this.lyrsSelected.length; index++) {
                const lyr = this.getObjectLayer(this.lyrsSelected[index].get('layerId'));
                if (lyr.getType() == CLASSIFICATION_TYPE_STRING) {
                    foundClassificationLayer = true;
                } else if (lyr.getType() == VALIDATION_STRING) {
                    foundValidationLayer = true;
                }
            }

            isEval = foundClassificationLayer && foundValidationLayer;

            if (isEval) {

                var features, intersetFeatures;

                this.lyrsSelected.forEach(lyr => {
                    var dataLyr = this.getObjectLayer(lyr.get('layerId'));
                    features = turf.featureCollection(dataLyr['features']);

                    console.log(turf.combine(features));

                    //intersetFeatures = intersetFeatures == undefined ? features : turf.collect(intersetFeatures, features, 'classId', 'classId');
                });

                console.log(intersetFeatures);
            }
            else {
                return;
            }
        }
    }

    createPieChartForArea(lyr){
        var dataLyr = this.getObjectLayer(lyr.get('layerId'));
        var features = dataLyr['features'];
        var classNames = dataLyr.getClassNames();
        var classColors = dataLyr.getClassColors();
        var classKeys = dataLyr.getKeysOfClasses();

        var dataPie = [];
        var classIndex = {};

        for (let index = 0, len = classKeys.length ; index < len; index++) {
            const key = classKeys[index];
            classIndex[classNames[key]] = index;

            dataPie.push(
                {
                    name: classNames[key],
                    y: 0,
                    color: classColors[key],
                    id: key
                }
            );
        }

        for (let index = 0; index < features.length; index++) {

            const polygon = features[index]['geometry']['coordinates'];
            const pos = classIndex[features[index]['properties']['className']];

            dataPie[pos]['y'] += turf.area(turf.polygon(polygon));
        }

        // Build the chart
        Highcharts.chart('container-stats', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: dataLyr.getName()
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true,
                    point: {
                        events: {
                            legendItemClick: function(e) {
                                var C_ID = e['target']['id'];

                                lyr.get('inactiveClasses')[C_ID] = !lyr.get('inactiveClasses')[C_ID];

                                lyr.get('showHideClass')(lyr, dataLyr);
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'Area',
                colorByPoint: true,
                data: dataPie
            }]
        });
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
