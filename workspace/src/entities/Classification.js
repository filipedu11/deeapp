
import { ClassificationDecode } from '../decode/ClassificationDecode';
import { MetadaClassification } from '../panels/classification/MetadataClassification';
import { Legend } from '../panels/Legend';

export class Classification{

    constructor(classificationID, classificationName, classificationDescription, 
        classificationRasterFile, classificationSource, classificationStats, classificationStyle, features, geojsonFile) {

        //Set the decode
        this.decodeClassification = new ClassificationDecode();

        this.classificationID = classificationID;
        this.classificationName = classificationName;
        this.classificationDescription = classificationDescription;
        this.classificationRasterFile = classificationRasterFile;
        this.classificationSource = classificationSource;
        this.classificationStats = classificationStats;
        this.classificationStyle = classificationStyle;
        this.features = features;
        this.geojsonFile = geojsonFile;

        //Create panel for classification
        this.metadataPanel = new MetadaClassification(this);
        this.legendPanel = new Legend(this);
    }

    getDecode(){
        return this.decodeClassification;
    }

    /**
     * Return the classification name
     */
    getId(){
        return this.classificationID;
    }

    /**
     * Return the classification name
     */
    getName(){
        return this.classificationName;
    }

    /**
     * Return the classification description
     */
    getDescription(){
        return this.classificationDescription;
    }

    /**
     * Return the classification author
     */
    getAuthor(){
        return this.classificationSource[this.getDecode().author[this.getDecode().key]];
    }

    /**
     * Return the classification algorithm
     */
    getClassifierAlgorithm(){
        return this.classificationSource[this.getDecode().classificationAlgorithm[this.getDecode().key]];
    }

    /**
     * Return the pre processement techniques used
     */
    getPreProcessementTechniquesUsed(){
        return this.classificationSource[this.getDecode().preProcTechniquesUsed[this.getDecode().key]];
    }

    /**
     * Return the pre processement techniques used
     */
    getPosProcessementTechniquesUsed(){
        return this.classificationSource[this.getDecode().postProcTechniquesUsed[this.getDecode().key]];
    }

    /**
     * Return the collected date of inputs (satelite images)
     */
    getCollectedDate(){
        return this.classificationSource[this.getDecode().collectedDate[this.getDecode().key]];
    }

    /**
     * Return the classification date
     */
    getClassificationDate(){
        return this.classificationSource[this.getDecode().classificationDate[this.getDecode().key]];
    }

    /**
     * Return the class stats of classification
     */
    getClassStats() {
        return this.classificationStats[this.getDecode().statsDecode.classStats[this.getDecode().key]];
    }
    
    /**
     * Return the global stats of classification
     */
    getGlobalStats() {
        return this.classificationStats[this.getDecode().statsDecode.globalStats[this.getDecode().key]];
    }

    /**
     * Return the properties / stats of each polygon
     */
    getPropertiesOfPolygon(index) {
        return this.features[index][this.getDecode().statsDecode.polygonProperties[this.getDecode().key]];
    }

    getColorOfClass(classId){
        var colorDict = this.classificationStyle[this.getDecode().color[this.getDecode().key]];
        return colorDict[classId];
    }

    getType(){
        return 'classification';
    }

    createMetadata(){
        this.metadataPanel.createMetadataPanel();
    }

    clearMetadata(){
        this.metadataPanel.clearMetadataPanel();
    }

    createLegend(){
        this.legendPanel.createLegend();
    }

    clearLegend(){
        this.legendPanel.clearLegend();
    }

    createStats(){
        this.statsPanel.createStatsPanel();
    }

    clearStats(){
        this.statsPanel.clearStatsPanel();
    }
}