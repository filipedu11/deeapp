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
import ScaleLine from 'ol/control/ScaleLine.js';
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
import { Metrics } from '../panels/Metrics.js';
import Swal from 'sweetalert2';

Highmore(Highcharts);
Histogram(Highcharts);

var BASE_TYPE_STRING = 'basemap';
var DRAW_LAYER_STRING = 'draw';
var CLASSIFICATION_TYPE_STRING = 'classification';
var VALIDATION_STRING = 'validation';
var EVALUATION_STRING = 'evaluation';

var w = new Worker('./worker.js');
var workerAreaFilter = new Worker('./workerAreaFilter.js');
var workerBufferFilter = new Worker('./workerBufferFilter.js');

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
        this.metrics = new Metrics();

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

        map.addControl(new ScaleLine());
        
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
            title: 'Mapas Base',
            fold: 'open',
            typeBase: BASE_TYPE_STRING,
        });

        var classifications = new LayerGroup({
            title: 'Classificação',
            fold: 'open',
            typeBase: CLASSIFICATION_TYPE_STRING
        });
        
        var validations = new LayerGroup({
            title: 'Validação',
            fold: 'open',
            typeBase: VALIDATION_STRING
        });

        var evaluations = new LayerGroup({
            title: 'Distribuição Espacial do Erro',
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
            typeBase: classObject.getType()
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
        this.createPolygonInteraction();
        this.createAreaFilterInteraction(dataLyr, layerSel);
        this.createBufferFilter(dataLyr, layerSel);

        this.addEventListenerToClearButton(dataLyr, layerSel);
        this.addEventToApplyButton(dataLyr, layerSel);

        layerSel.getSource().dispatchEvent('change');
        this.currentLayer = layerSel;
    }

    addEventListenerToClearButton(dataLyr, layerSel){
        
        var clearFilterPAnel = document.getElementById('reset-controller-settings');
        
        var mapViewer = this;

        var min = document.getElementById('area-min-number');
        var max = document.getElementById('area-max-number');

        var typeSelect = document.getElementById('type-geo');
        var classBufferSelect = document.getElementById('class-buffer');

        clearFilterPAnel.onclick = function(){
            if (mapViewer.vectorDraw.getSource().getFeatures().length > 0 )
                mapViewer.vectorDraw.getSource().removeFeature(mapViewer.vectorDraw.getSource().getFeatures()[0]);
            
            layerSel.getFilters().forEach(f => {
                layerSel.removeFilter(f);
            });

            typeSelect.value = typeSelect.options[0].value;
            classBufferSelect.value = classBufferSelect.options[0].value;

            min.value = dataLyr.getMinimumOccupiedArea();
            min.dispatchEvent(new Event('change'));
            max.value = dataLyr.getMaximumOccupiedArea();
            max.dispatchEvent(new Event('change'));
    
            let classKeys = dataLyr.getKeysOfClasses();
            let features = dataLyr.getFeatures();
    
            //CREATE CONFUSION MATRIX
            w.postMessage([classKeys, features, [min.value, max.value], null]);
        };
    }

    addEventToApplyButton(dataLyr, layerSel){
        
        var applyFilterPAnel = document.getElementById('apply-controller-settings');
        var mapViewer = this;

        applyFilterPAnel.onclick = function(){
            mapViewer.computeFilterPanel(layerSel);
        };
    }

    
    /**
     * Create the Stats panel with error matrix
     * 
     * @param {*} layerSel 
     */
    computeFilterPanel(layerSel) {
        let format = new GeoJSON();
                    
        let dataLyr = this.getObjectLayer(layerSel.get('layerId'));  

        let min = document.getElementById('area-min-number');
        let max = document.getElementById('area-max-number');

        let featsFilter = this.vectorDraw.getSource().getFeatures();

        let errorMatrixAux = this.errorMatrix;
        errorMatrixAux.loadingFilterMatrix();
        
        let classKeys = dataLyr.getKeysOfClasses();
        let features = dataLyr.getFeatures();

        let polygonFilter = featsFilter.length > 0 ? 
            format.writeFeatureObject(featsFilter[0], {featureProjection: 'EPSG:3857'}) : null;
        
        //CREATE CONFUSION MATRIX
        w.postMessage([classKeys, features, [min.value, max.value], polygonFilter]);
        
    }

    /**
     * Create the Stats panel with error matrix
     * 
     * @param {*} layerSel 
     */
    createStatsPanel(layerSel) {
                    
        var dataLyr = this.getObjectLayer(layerSel.get('layerId')); 
        var errorMatrixAux = this.errorMatrix;
        var metrics = this.metrics;

        var classKeys = dataLyr.getKeysOfClasses();
        var features = dataLyr.getFeatures();

        //CREATE CONFUSION MATRIX
        w.addEventListener('message', function(e) {
            errorMatrixAux.createConfusionMatrix(dataLyr, e.data, true);   
        });
        w.postMessage([classKeys, features, null, null]);
 
        //CREATE AREA FILTER GRAPH
        let precision = 3;
        let steps = dataLyr.getUniqueValuesForOccupiedAreaByGivingPrecisionScale(precision);
        workerAreaFilter.addEventListener('message', function(e) {
            metrics.createMetricsGraph(e.data);
        }, false);
        workerAreaFilter.postMessage([classKeys, features, steps]);

        //CREATE BUFFER FILTER GRAPH
        let valLayer = this.getObjectLayer(dataLyr.validationLayer.get('layerId'));
        workerBufferFilter.addEventListener('message', function(e) {
            metrics.createMetricsGraphForBuffer(e.data);
        }, false);
        workerBufferFilter.postMessage([classKeys, features, valLayer.getFeatures()]);

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

        classBuffer.addEventListener('change', function () {
            computeBuffer();
        });

        buffer.addEventListener('change', function () {
            computeBuffer();
        });

        function computeBuffer() {

            if (0 == classBuffer.value && buffer.value == buffer.min ) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro no tamanho do buffer!',
                    text: 'Não é possivel computar o buffer com tamanho 0 para as fronteiras.'
                });
                return;
            }

            if (buffer.value < buffer.min || buffer.value > buffer.max ) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro no tamanho do buffer!',
                    text: 'Não é possivel computar buffers com valores inferiores a '
                            + buffer.min + ' e superiores a ' + buffer.max + '.'
                });
                return;
            }

            if (classBuffer.value != -1) {
                if (allFeatures.length > 1) {

                    let mainFeat = mapViewer.computeBufferAuxiliary(allFeatures, buffer.value, classBuffer.value);

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

    computeBufferAuxiliary(allFeatures, value, classBuffer) {

        let mainFeats = [];
        var options = {tolerance: 0.0005
            , highQuality: false, mutate: false};

        for (let index = 0, len = allFeatures.length; index < len; index++) {
            const feat = allFeatures[index];
            
            if (feat.properties.classId == 1) {

                let featBuffer;
                let bufferLine = feat;

                if (value > 0) {
                    if (0 == classBuffer) {
                        featBuffer = turf.simplify(turf.polygonToLine(feat), options);
                    } else {
                        featBuffer = turf.simplify(feat, options);
                    }
                    bufferLine = turf.buffer(featBuffer, value);
                }

                mainFeats.push(bufferLine);
            }
        }

        return turf.union.apply(this, mainFeats);
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

        // eslint-disable-next-line no-unused-vars
        slideArea.noUiSlider.on('update', function (values, handle) {
            minAreaInput.value = values[0];
            maxAreaInput.value = values[1];

            layerSel.getSource().dispatchEvent('change');
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
    createPolygonInteraction(){

        var draw; // global so we can remove it later
        var typeSelect = document.getElementById('type-geo');
        
        this.map.addLayer(this.vectorDraw);

        var mapViewer = this;

        typeSelect.onchange = function() {
            mapViewer.map.removeInteraction(draw);
            addInteraction();
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
            }
        });
    }

    /**
     * Remove the controller panel
     */
    clearFilterControllers(){
        this.controllers.hideControls();

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
