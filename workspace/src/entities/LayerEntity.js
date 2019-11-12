
import { LayerDecode } from '../decode/LayerDecode';
import { MetadaLayer } from '../panels/layer/MetadataLayer';
import { Legend } from '../panels/Legend';
import * as turf from '@turf/turf';

export class LayerEntity{

    constructor(layerID, layerName, layerDescription, 
        layerRasterFile, layerSource, layerStats, layerStyle, features, classNames, geojsonFile, type) {

        //Set the decode
        this.decodeLayer = new LayerDecode();

        this.layerID = layerID;
        this.layerName = layerName;
        this.layerDescription = layerDescription;
        this.layerRasterFile = layerRasterFile;
        this.layerSource = layerSource;
        this.layerStats = layerStats;
        this.layerStyle = layerStyle;
        this.features = features;
        this.classNames = classNames;
        this.geojsonFile = geojsonFile;
        this.type = type;
        this.occupiedAreaOfEachFeatures = this.computeOccupiedArea(features);
        this.minOccupiedArea = Math.min(...this.occupiedAreaOfEachFeatures);
        this.maxOccupiedArea = Math.max(...this.occupiedAreaOfEachFeatures);

        //Create panel for layer
        this.metadataPanel = new MetadaLayer(this);
        this.legendPanel = new Legend(this);
    }

    getDecode(){
        return this.decodeLayer;
    }

    /**
     * Return the layer name
     */
    getId(){
        return this.layerID;
    }

    /**
     * Return the layer name
     */
    getName(){
        return this.layerName;
    }

    getType(){
        return this.type;
    }

    /**
     * Return the layer description
     */
    getDescription(){
        return this.layerDescription;
    }

    /**
     * Return the layer author
     */
    getAuthor(){
        return this.layerSource[this.getDecode().author[this.getDecode().key]];
    }

    /**
     * Return the layer algorithm
     */
    getClassifierAlgorithm(){
        return this.layerSource[this.getDecode().layerAlgorithm[this.getDecode().key]];
    }

    /**
     * Return the pre processement techniques used
     */
    getPreProcessementTechniquesUsed(){
        return this.layerSource[this.getDecode().preProcTechniquesUsed[this.getDecode().key]];
    }

    /**
     * Return the pre processement techniques used
     */
    getPosProcessementTechniquesUsed(){
        return this.layerSource[this.getDecode().postProcTechniquesUsed[this.getDecode().key]];
    }

    /**
     * Return the collected date of inputs (satelite images)
     */
    getCollectedDate(){
        return this.layerSource[this.getDecode().collectedDate[this.getDecode().key]];
    }

    /**
     * Return the layer date
     */
    getLayerDate(){
        return this.layerSource[this.getDecode().layerDate[this.getDecode().key]];
    }

    /**
     * Return the properties / stats of each polygon
     */
    getPropertiesOfPolygon(index) {
        return this.features[index][this.getDecode().statsDecode.polygonProperties[this.getDecode().key]];
    }

    /**
     * Return the features from layers
     */
    getFeatures(){
        return this.features;
    }

    /**
     * 
     * Return the define color of a class by giving the class id
     * 
     * @param {number} classId 
     */
    getColorOfClass(classId){
        var colorDict = this.layerStyle[this.getDecode().color[this.getDecode().key]];
        return colorDict[classId];
    }

    /**
     * 
     * Return the class name by giving the class id
     * 
     * @param {number} classId 
     */
    getNameOfClass(classId){
        return this.classNames[classId];
    }

    /**
     * Return the keys of classNames dictionary
     */
    getKeysOfClasses(){
        return Object.keys(this.classNames);
    }

    /**
     * Return the list of class names
     */
    getClassNames(){
        return this.classNames;
    }

    //FOR EVAL LAYERS
    getIndividualClassNames(){

        var categories = {};
        var cN;

        Object.values(this.classNames).forEach(cName => {    
            cN = cName.split(' | ')[0].replace('(c)','').replace('(v)','');
            if( !categories[cN] ) categories[cN] = true;

        });

        return categories;
    }

    getBinaryClassNamesForLegend(){
        return {
            1: 'Verdadeiros Negativos',
            2: 'Falsos Negativos', 
            3: 'Falsos Positivos', 
            4: 'Verdadeiros Positivos'
        };
    }
    
    getBinaryClassNamesForErrorMatrix(){
        return {
            '00' : 'Falsos Positivos', 
            '01' : 'Verdadeiros Positivos',
            '10' : 'Verdadeiros Negativos',
            '11' : 'Falsos Negativos'
        };
    }

    getClassColors(){
        return this.layerStyle[this.getDecode().color[this.getDecode().key]];
    }

    createMetadata(){
        this.metadataPanel.createMetadataPanel();
    }

    clearMetadata(){
        this.metadataPanel.clearMetadataPanel();
    }

    computeOccupiedArea(features){

        var dataArea = [];

        for (let index = 0, len = features.length; index < len; index++) {
            const polygon = features[index]['geometry']['coordinates'];

            //Convert area to hectares (ha = m^2 / 10000)
            dataArea.push(turf.area(turf.polygon(polygon))/10000);
        }

        return dataArea;
    }

    getMinimumOccupiedArea(){
        return Math.floor(this.minOccupiedArea * 10000) / 10000;
    }

    getMaximumOccupiedArea(){
        return Math.ceil(this.maxOccupiedArea * 10000) / 10000;
    }
}