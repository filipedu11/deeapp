
import { LayerDecode } from '../decode/LayerDecode';
import { MetadaLayer } from '../panels/layer/MetadataLayer';
import { Legend } from '../panels/Legend';

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

    getFeatures(){
        return this.features;
    }

    getColorOfClass(classId){
        var colorDict = this.layerStyle[this.getDecode().color[this.getDecode().key]];
        return colorDict[classId];
    }

    getNameOfClass(classId){
        return this.classNames[classId];
    }

    getKeysOfClasses(){
        return Object.keys(this.classNames);
    }

    getClassNames(){
        return this.classNames;
    }

    //FOR EVAL LAYERS
    getIndividualClassNames(){

        var categories = {};
        var cN;

        Object.values(this.classNames).forEach(cName => {    
            cN = cName.split(' vs ')[0];
            if( !categories[cN] ) categories[cN] = true;

        });

        return categories;
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
}