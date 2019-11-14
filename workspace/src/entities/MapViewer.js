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

import { ValidationEntity } from './ValidationEntity';
import { ClassificationEntity } from './ClassificationEntity';
import { EvaluationEntity } from './EvalutationEntity';

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

    /**
     * Constructor of MapViewer class
     * 
     * 1. The initialization of aplication is done here
     */
    constructor(){

        this.baseDict = {};
        this.baseArray = [];

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

        this.map.set('mapViewer', this);
    }

    /**
     * Method to create the initial openalayers map
     */
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

    /**
     * Method to create the sidebar panel
     */
    createSideBar(){
        var sidebar = new Sidebar({ element: 'sidebar', position: 'left' });
        this.map.addControl(sidebar);
    }

    /**
     * Method to create the layer switcher
     */
    loadLayerSwitcher(){
        var toc = document.getElementById('layers');
        LayerSwitcher.renderPanel(this.map, toc);
    }

    /**
     * Method to create the 4 different groups of layers
     * 
     *  1. Evaluation
     *  2. Classification
     *  3. Validation
     *  4. Base
     */
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

    /**
     * Method to add one layer to the given group
     * 
     * @param {string} typeGroup 
     * @param {*} newLayer 
     */
    addLayerToMapGroup(typeGroup, newLayer){

        this.map.getLayers().forEach(function(layer) {
            if(layer.getLayers && layer.get('typeBase') == typeGroup){
                layer.getLayers().push(newLayer);
            }
        });
    }

    /**
     * Add base layers to map
     */
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

    /**
     * Method to return the map
     */
    getMap(){
        return this.map;
    }

    /**
     * Set the selected layers in layer switch
     * 
     * @param {[]} lyrsSelected 
     */
    setLyrsSelected(lyrsSelected){
        this.lyrsSelected = lyrsSelected;
    }

    /**
     * Create the ValidationEntity object with the given geojson file
     * 
     * @param {*} layerGeojson 
     */
    createValidationLayerObj(layerGeojson) {
        var cD = new LayerDecode();
        var k = cD.key;

        var id = layerGeojson[cD.layerID[k]];

        var lyr = new ValidationEntity(
            id,
            layerGeojson[cD.layerName[k]],
            layerGeojson[cD.layerDescription[k]],
            layerGeojson[cD.layerRasterFile[k]],
            layerGeojson[cD.layerSource[k]],
            layerGeojson[cD.layerStats[k]],
            layerGeojson[cD.layerStyle[k]],
            layerGeojson[cD.features[k]],
            layerGeojson[cD.classNames[k]],
            layerGeojson
        );

        this.allLayersDict[id] = lyr;

        return lyr;
    }

    /**
     * Create the Classification object with the given geojson file
     * 
     * @param {*} layerGeojson 
     */
    createClassificationLayerObj(layerGeojson) {
        var cD = new LayerDecode();
        var k = cD.key;

        var id = layerGeojson[cD.layerID[k]];

        var lyr = new ClassificationEntity(
            id,
            layerGeojson[cD.layerName[k]],
            layerGeojson[cD.layerDescription[k]],
            layerGeojson[cD.layerRasterFile[k]],
            layerGeojson[cD.layerSource[k]],
            layerGeojson[cD.layerStats[k]],
            layerGeojson[cD.layerStyle[k]],
            layerGeojson[cD.features[k]],
            layerGeojson[cD.classNames[k]],
            layerGeojson
        );

        this.allLayersDict[id] = lyr;

        return lyr;
    }

    /**
     * Create the EvaluationEntity object with the given geojson file
     * 
     * @param {*} layerGeojson 
     */
    createEvaluationnLayerObj(layerGeojson, validation, classification) {
        var cD = new LayerDecode();
        var k = cD.key;

        var id = layerGeojson[cD.layerID[k]];

        var lyr = new EvaluationEntity(
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
            validation, 
            classification
        );

        this.allLayersDict[id] = lyr;

        return lyr;
    }

    /**
     * Add classified image (png/tiff) to map 
     * @param {*} classifiedImage 
     */
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

    /**
     * Add classification layer to map
     * 
     * @param {*} classiGeojson 
     */
    addClassification(classiGeojson){

        var newLayer = this.createLayer(classiGeojson, this.createClassificationLayerObj(classiGeojson));

        this.addLayerToMapGroup(CLASSIFICATION_TYPE_STRING, newLayer);

        this.loadLayerSwitcher();

        return newLayer;
    }

    /**
     * Add validation layer to map
     * @param {*} validationGeojson 
     */
    addValidation(validationGeojson){

        var newLayer = this.createLayer(validationGeojson, this.createValidationLayerObj(validationGeojson));

        this.addLayerToMapGroup(VALIDATION_STRING, newLayer);

        this.loadLayerSwitcher();

        return newLayer;
    }

    /**
     * Add evaluation layer to map
     * @param {*} evaluationGeojson 
     */
    addEvaluation(evaluationGeojson, validation, classification){

        var newLayer = this.createLayer(evaluationGeojson, this.createEvaluationnLayerObj(evaluationGeojson, validation, classification));

        this.addLayerToMapGroup(EVALUATION_STRING, newLayer);

        this.loadLayerSwitcher();
    }

    /**
     * Remove evaluation layer in map
     * 
     * @param {*} evaluationLayer 
     */
    removeEvaluation(evaluationLayer){

        this.map.removeLayer(evaluationLayer);

        this.loadLayerSwitcher();
    }

    /**
     * Define the openlayer style for the given lyr
     * 
     * @param {*} lyr 
     */
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

            if ( !inactiveC[feature.get(fD.classId[k])] && ( drawFeature || classAux.getType() !== EVALUATION_STRING )) {
                return [new Style({
                    fill: new Fill({
                        color: colorAux,
                    }),
                })];
            }
        });
    }

    /**
     * Create source to set in layer (openlayer object)
     * @param {*} lyrGeojson 
     */
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

    /**
     * Create layer (openlayer object) to insert in map
     * @param {*} geojsonObject 
     * @param {*} classObject 
     */
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

    /**
     * Create metadata panel for the specified layer
     * 
     * @param {*} lyrId 
     */
    createMetadata(lyrId){
        var cl = this.getObjectLayer(lyrId);
        cl.createMetadata();
    }

    /**
     * Clear metadata panel for the specified layer
     * 
     * @param {*} lyrId 
     */
    clearMetadata(lyrId){
        var cl = this.getObjectLayer(lyrId);
        cl.clearMetadata();
    }

    /**
     * Update legend that correspond to the top layer
     */
    updateLegend(){
        if (this.currentLayer) 
            this.legend.createLegend(this.getObjectLayer(this.currentLayer.get('layerId')), this.currentLayer);
        else
            this.legend.clearLegend();
    }
    
    /**
     * Get LayerEntity object by giving the id
     * @param {*} id 
     */
    getObjectLayer(id){
        return this.allLayersDict[id];
    }

    /**
     * Check if the select layer is diff than the previous selected
     * @param {*} layerSel 
     */
    isLayerSelectDiffThanCurrent(layerSel){
        if (!this.currentLayer)
            return true;
        
        return this.currentLayer.get('layerId') !== layerSel.get('layerId');
    }

    /**
     * Create the controller filter panel
     * 
     * @param {*} layerSel 
     */
    createControllersFilter(layerSel) {

        if ( this.controllers.isDisplayed ){
            this.clearFilterControllers();
        }

        var dataLyr = this.getObjectLayer(layerSel.get('layerId'));  

        this.addChangeListenerVectorDraw(dataLyr, layerSel);

        this.controllers.displayControllers();
        this.createPolygonInteraction(dataLyr, layerSel);
        this.createAreaFilterInteraction(dataLyr, layerSel);
        this.createBufferFilter(dataLyr, layerSel);

        layerSel.getSource().dispatchEvent('change');
        this.currentLayer = layerSel;
    }

    /**
     * Create the Stats panel with error matrix
     * 
     * @param {*} layerSel 
     */
    createStatsPanel(layerSel) {
        var format = new GeoJSON();
                    
        var dataLyr = this.getObjectLayer(layerSel.get('layerId'));  

        var min = document.getElementById('area-min-number');
        var max = document.getElementById('area-max-number');
        var featsFilter = this.vectorDraw.getSource().getFeatures();

        var calcArea = this.calcOccupiedAreaForEachClass(dataLyr);
        var calcAreaFilter = this.calcOccupiedAreaForEachClass(
            dataLyr,  
            [min.value, max.value], 
            featsFilter.length > 0 ? 
                format.writeFeatureObject(featsFilter[0], {featureProjection: 'EPSG:3857'}) : null);

        this.errorMatrix.createConfusionMatrix(dataLyr, calcArea);

        this.errorMatrix.createConfusionMatrix(
            dataLyr, 
            calcAreaFilter,
            true
        );
    }

    /**
     * 
     * @param {*} dataLyr 
     * @param {*} layerSel 
     */
    createBufferFilter(dataLyr, layerSel){
        var mapViewer = this;
        var format = new GeoJSON();
        
        var buffer = document.getElementById('area-buffer');
        var classBuffer = document.getElementById('class-buffer');

        var valLayer = this.getObjectLayer(dataLyr.validationLayer.get('layerId'));
        var allFeatures = valLayer.getFeatures();

        for (const key of valLayer.getKeysOfClasses()) {
            const className = valLayer.getNameOfClass(key);

            var option = document.createElement('option');
            option.text = className;
            option.value = key;

            classBuffer.add(option);
        }

        classBuffer.addEventListener('change', function () {
            computeBuffer();
        });

        buffer.addEventListener('change', function () {
            computeBuffer();
        });

        function computeBuffer() {
            if (classBuffer.value != -1) {
                if (allFeatures.length > 1) {

                    let mainFeats = [];
                    var options = {tolerance: 0.0001, highQuality: false, mutate: false};

                    for (let index = 0, len = allFeatures.length; index < len; index++) {
                        const feat = allFeatures[index];
                        if (feat.properties.classId == classBuffer.value) {

                            let featLine = turf.polygonToLine(turf.simplify(feat, options));
                            let bufferLine = turf.buffer(featLine, buffer.value);
                            mainFeats.push(turf.simplify(bufferLine, options));
                        }
                    }

                    let mainFeat = turf.union.apply(this, mainFeats);

                    if (mainFeat) {
                        if (mapViewer.vectorDraw.getSource().getFeatures().length > 0 )
                            mapViewer.vectorDraw.getSource().removeFeature(mapViewer.vectorDraw.getSource().getFeatures()[0]);
                        
                        layerSel.getFilters().forEach(f => {
                            layerSel.removeFilter(f);
                        });

                        mapViewer.vectorDraw.getSource().addFeature(format.readFeature(mainFeat, {featureProjection: 'EPSG:3857'}));
                    }
                }
            }
        }

    }

    /**
     * Create the area filter interaction to add in controller panel
     * 
     * @param {*} dataLyr 
     * @param {*} layerSel 
     */
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
                decimals: 4
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
                
            var calcAreaFilter = mapViewer.calcOccupiedAreaForEachClass(
                dataLyr,  
                [minAreaInput.value, maxAreaInput.value], 
                filterPoly);

            mapViewer.errorMatrix.createConfusionMatrix (
                dataLyr,
                calcAreaFilter,
                true);
        });

        minAreaInput.addEventListener('change', function () {
            slideArea.noUiSlider.set([this.value, null]);
        });

        maxAreaInput.addEventListener('change', function () {
            slideArea.noUiSlider.set([null, this.value]);
        });
    }
 
    /**
     * Create the polygon interaction to add in controller panel
     * 
     * @param {*} dataLyr 
     * @param {*} layerSel 
     */
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

            var calcAreaFilter = mapViewer.calcOccupiedAreaForEachClass(
                dataLyr,  
                [min.value, max.value], 
                null);

            mapViewer.errorMatrix.createConfusionMatrix (
                dataLyr,
                calcAreaFilter,
                true);
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
            }
        }
    }

    addChangeListenerVectorDraw(dataLyr, layerSel) {
        var format = new GeoJSON();
        var mapViewer = this;

        var min = document.getElementById('area-min-number');
        var max = document.getElementById('area-max-number');
        
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

                const mask = new Mask({ feature: mainFeat, inner:false, fill: new Fill({ color:[0,0,0,0.8] }) });
                        
                layerSel.getFilters().forEach(f => {
                    layerSel.removeFilter(f);
                });

                layerSel.addFilter(mask);

                var featAux = format.writeFeatureObject(mainFeat, {featureProjection: 'EPSG:3857'});
                var calcAreaFilter = mapViewer.calcOccupiedAreaForEachClass(
                    dataLyr,
                    [min.value, max.value],
                    featAux);
            
                mapViewer.errorMatrix.createConfusionMatrix (
                    dataLyr,
                    calcAreaFilter,
                    true);
            }
        });
    }

    /**
     * Compute the data for the error matrix according with:
     * 
     *  1. Selected interval area
     *  2. Polygon draw
     * 
     * calcOccupiedAreaForEachClass(dataLayer) -> data for error matrix without filter
     * calcOccupiedAreaForEachClass(dataLayer, filterAreaInterval, polygonFilter) -> data for error matrix with filter
     * 
     * @param {*} dataLyr 
     * @param {*} filterAreaInterval 
     * @param {*} polygonFilter 
     */    
    calcOccupiedAreaForEachClass(dataLyr, filterAreaInterval, polygonFilter){

        var classKeys = dataLyr.getKeysOfClasses();
        var features = dataLyr.getFeatures();

        var dataArea = [];
        var classIndex = {};

        for (let index = 0, len = classKeys.length ; index < len; index++) {
            const key = classKeys[index];
            classIndex[key] = index;
            dataArea[index] = 0;
        }

        var calcArea;

        if(polygonFilter) {

            var tree = geojsonRbush();
            var rbush = tree.load(features);
            var containElements;

            var drawPolygons = polygonFilter.geometry.coordinates;
            let lenDrawPolys = drawPolygons.length;

            for (let j = 0; j < lenDrawPolys; j++) {

                const coords = lenDrawPolys == 1 ? [drawPolygons[j]] : drawPolygons[j];
                let poly;
                try {
                    poly = turf.polygon(coords);
                } catch (error) {
                    let line = turf.lineString(coords);
                    poly = turf.lineStringToPolygon(line);
                }

                if (rbush) {
                    containElements = rbush.search(poly).features;
                }
                
                let areaPoly = turf.area(poly);

                for (let index = 0, len = containElements.length; index < len && poly; index++) {

                    const polygon = containElements[index];
                    const pos = classIndex[parseInt(containElements[index]['properties']['classId'])];

                    let areaPolygon = turf.area(polygon);

                    let diffPolygonPoly = turf.difference(polygon, poly);
                    let diffPolyPolygon = turf.difference(poly, polygon);

                    let areaPolygonDiff = diffPolygonPoly ? turf.area(diffPolygonPoly) : 0;
                    let areaPolyDiff = diffPolyPolygon ? turf.area(diffPolyPolygon) : 0;

                    calcArea = (areaPolygon + areaPoly - (areaPolygonDiff + areaPolyDiff)) / 10000;

                    //Convert area to hectares (ha = m^2 / 10000)
                    //calcArea = intersectArea ? turf.area(intersectArea) / 10000 : 0;

                    if (filterAreaInterval[0] <= calcArea && calcArea <= filterAreaInterval[1]) {
                        dataArea[pos] = dataArea[pos] != null ? 
                            dataArea[pos] + calcArea : calcArea;
                    }
                }
            }
        } else {

            for (let index = 0, len = features.length; index < len; index++) {
                const polygon = features[index];
                const pos = classIndex[parseInt(features[index]['properties']['classId'])];

                //Convert area to hectares (ha = m^2 / 10000)
                calcArea = turf.area(polygon) / 10000;
                if (!filterAreaInterval || filterAreaInterval[0] <= calcArea && calcArea <= filterAreaInterval[1]) {
                    dataArea[pos] = dataArea[pos] != null ? 
                        dataArea[pos] + calcArea : calcArea;
                }
            }
        }

        return dataArea;
    }

    /**
     * Remove the controller panel
     */
    clearFilterControllers(){
        this.controllers.clearControls();

        this.vectorDraw.getSource().getFeatures().forEach(feat => {
            this.vectorDraw.getSource().removeFeature(feat);
        });

        document.getElementById('area-number-slider').noUiSlider.destroy();

        this.map.removeLayer(this.vectorDraw);
    }

    /**
     * Clear the map and define the new layer
     * 
     */
    resetMap() {
        this.errorMatrix.clearStatsPanel();
        this.clearFilterControllers();
    }

    /**
     * define the new layer
     * 
     * @param {*} l 
     */
    setCurrentLayer(l){
        this.currentLayer = l;
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
