import 'jquery';

/**
 * Import ol classes
 */
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import LayerGroup from 'ol/layer/Group';
import XYZ from 'ol/source/XYZ.js';
import Static from 'ol/source/ImageStatic.js';

import LayerSwitcher from '../panels/LayerSwitcher.js';
import Sidebar from '../../static/js/sidebar.js';
import { Progress } from '../../static/js/Progress.js';

import { LayerEntity } from './LayerEntity';
import { LayerDecode } from '../decode/LayerDecode';

import {Style, Fill, Stroke} from 'ol/style';
import geojsonvt from 'geojson-vt';

import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/VectorTile';
import Vector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/VectorTile';
import VectorL from 'ol/layer/Vector';
import ImageLayer from 'ol/layer/Image.js';
import Control from 'ol/control';
import Mask from 'ol-ext/filter/Mask';

import Projection from 'ol/proj/Projection';
import Draw, {createBox}  from 'ol/interaction/Draw.js';

import Highcharts from 'highcharts';
import Highmore from 'highcharts/highcharts-more';
import Histogram from 'highcharts/modules/histogram-bellcurve';

import { ErrorMatrix } from '../panels/ErrorMatrix';

import { Legend } from '../panels/Legend.js';
import { Controllers } from '../panels/Controllers';

import * as turf from '@turf/turf';

import noUiSlider from 'nouislider';
import wNumb from 'wnumb';

Highmore(Highcharts);
Histogram(Highcharts);

/*eslint no-undef: "error"*/
/*eslint-env node*/
// eslint-disable-next-line no-unused-vars
var geojsonRbush = require('geojson-rbush').default;

var BASE_TYPE_STRING = 'basemap';
var DRAW_LAYER_STRING = 'draw';
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

        
        this.featsUnselected = {};

        this.extendStudyArea = null;
        this.projStudyArea = null;

        //Create the initial map
        this.map =  this.createInitMap();
        this.errorMatrix = new ErrorMatrix();
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

        this.vectorDraw = new VectorL({
            typeBase: DRAW_LAYER_STRING,
            source: new Vector({
                wrapX: false
            }),
            style: new Style({
                stroke: new Stroke({
                    color: 'rgba(15, 133, 240)',
                    width: 2
                })
            })
        });

        var map = new Map({
            target: 'map',
            view: new View({
                center: [0, 0],
                zoom: 0,
                maxZoom: 24,
                minZoom: 2
            }),
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

    addClassifiedImage(classifiedImage){
    
        var projection = this.projStudyArea;
        var extent = this.extendStudyArea;
        
        var newLayer = new ImageLayer({
            source: new Static({
                url: classifiedImage,
                projection: projection,
                imageExtent: extent
            }),
            visible: false,
            title: 'Imagem Satélite',
            typeBase: BASE_TYPE_STRING
        });

        this.addLayerToMapGroup(BASE_TYPE_STRING, newLayer);

        this.loadLayerSwitcher();
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

        var min = document.getElementById('area-min-number');
        var max = document.getElementById('area-max-number');

        // eslint-disable-next-line no-unused-vars
        lyr.setStyle(function name(feature, resolution) {

            var colorAux = classAux.getColorOfClass(feature.get(fD.classId[k]));

            var drawFeature =  min.value <= feature.get('areaInHectare') && feature.get('areaInHectare') <= max.value;

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

        if (!this.extendStudyArea){
            this.extendStudyArea = vectorSource.getExtent();
            this.projStudyArea = vectorSource.getProjection();
        }

        var layer = new VectorLayer({
            title: classObject.getName(),
            visible: false,
            source: source,
            layerId: classObject.getId(),
            sourceAux: vectorSource,
            inactiveClasses: {},
            typeBase: classObject.getType(),

        });

        this.createStyle(layer, []);

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
        var layerSel = this.lyrsSelected[lenSelectLayer-1];

        if (lenSelectLayer > 0) this.legend.createLegend(this.getObjectLayer(layerSel.get('layerId')), layerSel);
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

        var foundEvalLayers = [];
        var format = new GeoJSON();

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

            
            var min = document.getElementById('area-min-number');
            var max = document.getElementById('area-max-number');
            var featsFilter = this.vectorDraw.getSource().getFeatures();

            this.createConfusionMatrixFiltered(
                dataLyr, 
                [min.value, max.value], 
                featsFilter.length > 0 ? 
                    format.writeFeatureObject(featsFilter[0], {featureProjection: 'EPSG:3857'}) : null
            );
        }
   
        if ( !this.controllers.isDisplayed ){
            this.controllers.createControllers();
            this.createPolygonInteraction(dataLyr, layerSel);
            this.createAreaFilterInteraction(dataLyr, layerSel);
        }

        layerSel.getSource().dispatchEvent('change');
        this.currentLayer = layerSel;
    }

    createAreaFilterInteraction(dataLyr, layerSel){ 

        var min = dataLyr.getMinimumOccupiedArea();
        var max = dataLyr.getMaximumOccupiedArea();

        var minAreaInput = document.getElementById('area-min-number');
        var maxAreaInput = document.getElementById('area-max-number');

        var slideArea = document.getElementById('area-number-slider');

        var mapViewer = this;

        noUiSlider.create(slideArea, {
            start: [min, max],
            connect: true,
            range: {
                'min': min,
                'max': max
            },
            format: wNumb({
                decimals: 5
            })
        });

        var format = new GeoJSON();

        // eslint-disable-next-line no-unused-vars
        slideArea.noUiSlider.on('update', function (values, handle) {
            minAreaInput.value = values[0];
            maxAreaInput.value = values[1];

            layerSel.getSource().dispatchEvent('change');
            var featAux = mapViewer.vectorDraw.getSource().getFeatures();
            var filterPoly = null;

            if (featAux.length == 1 )
                filterPoly =  format.writeFeatureObject(featAux[0], {featureProjection: 'EPSG:3857'});
            
            mapViewer.errorMatrix.createConfusionMatrixFiltered(
                dataLyr, 
                [minAreaInput.value, maxAreaInput.value], 
                filterPoly);
        });

        minAreaInput.addEventListener('change', function () {
            slideArea.noUiSlider.set([this.value, null]);
        });

        maxAreaInput.addEventListener('change', function () {
            slideArea.noUiSlider.set([null, this.value]);
        });
    }
 
    createPolygonInteraction(dataLyr, layerSel){

        var draw; // global so we can remove it later
        var typeSelect = document.getElementById('type-geo');
        var clearPolygon = document.getElementById('clear-polygon-draw');
        
        this.map.addLayer(this.vectorDraw);

        var mapViewer = this;

        typeSelect.onchange = function() {
            mapViewer.map.removeInteraction(draw);
            addInteraction();
        };

        var min = document.getElementById('area-min-number');
        var max = document.getElementById('area-max-number');


        clearPolygon.onclick = function(){
            if (mapViewer.vectorDraw.getSource().getFeatures().length > 0 )
                mapViewer.vectorDraw.getSource().removeFeature(mapViewer.vectorDraw.getSource().getFeatures()[0]);
            
            layerSel.getFilters().forEach(f => {
                layerSel.removeFilter(f);
            });


            mapViewer.errorMatrix.createConfusionMatrixFiltered(dataLyr, [min.value, max.value], null);
        };

        function addInteraction() {
            var value = typeSelect.value;
            var geometryFunction;
            var freehand = false;

            if (value === 'Box') {
                value = 'Circle';
                geometryFunction = createBox();
            } else if (value === 'Free') {
                value = 'Polygon';
                freehand = true;
            }

            if (value !== 'None') {
                draw = new Draw({
                    source: mapViewer.vectorDraw.getSource(),
                    type: /** @type {ol.geom.GeometryType} */ value,
                    geometryFunction: geometryFunction,
                    freehand: freehand
                });

                mapViewer.map.addInteraction(draw);

                var format = new GeoJSON();

                // eslint-disable-next-line no-unused-vars
                mapViewer.vectorDraw.getSource().on('addfeature', function(e){

                    var featGeo, unionFeat;
                    var allFeatures = mapViewer.vectorDraw.getSource().getFeatures();
                    var mainFeat = allFeatures[0];

                    if (allFeatures.length > 1) {

                        var mainFeatGeo = format.writeFeatureObject(mainFeat);
                        mapViewer.vectorDraw.getSource().removeFeature(mainFeat);

                        for (let index = 1; index < allFeatures.length; index++) {

                            const feat = allFeatures[index];
                            featGeo = format.writeFeatureObject(feat);
                            mainFeatGeo = turf.union(mainFeatGeo,featGeo);
                            mapViewer.vectorDraw.getSource().removeFeature(feat);
                        }
                        
                        unionFeat = format.readFeature(mainFeatGeo);
                        mapViewer.vectorDraw.getSource().addFeature(unionFeat);
                        
                    } else if (allFeatures.length == 1) {

                        const mask = new Mask({ feature: mainFeat, inner:false, fill: new Fill({ color:[255,255,255,0.8] }) });
                        
                        layerSel.getFilters().forEach(f => {
                            layerSel.removeFilter(f);
                        });

                        layerSel.addFilter(mask);

                        var featAux = format.writeFeatureObject(mainFeat, {featureProjection: 'EPSG:3857'});
                        mapViewer.errorMatrix.createConfusionMatrixFiltered(
                            dataLyr, 
                            [min.value, max.value],
                            featAux);
                    }
                });
            }
        }
    }

    createConfusionMatrix(lyr){
        var dataLyr = this.getObjectLayer(lyr.get('layerId'));
        this.errorMatrix.createConfusionMatrix(lyr, dataLyr);
    } 

    createConfusionMatrixFiltered(dataLyr, filterAreaInterval, polygonFilter){
        this.errorMatrix.createConfusionMatrixFiltered(dataLyr, filterAreaInterval, polygonFilter);
    }

    clearStatsPanel(){
        this.errorMatrix.clearStatsPanel();
        this.controllers.clearControls();

        this.vectorDraw.getSource().getFeatures().forEach(feat => {
            this.vectorDraw.getSource().removeFeature(feat);
        });
        this.map.removeLayer(this.vectorDraw);
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
