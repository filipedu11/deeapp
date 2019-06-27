
import { ClassificationDecode } from '../decode/ClassificationDecode';
import { MetadaClassification } from '../panels/classification/MetadataClassification';
import { Legend } from '../panels/Legend';

export class Classification{

    constructor(classificationID, classificationName, classificationDescription, 
        classificationRasterFile, classificationSource, classificationStats, classificationStyle, features, geojsonFile) {

        //Set the decode
        this.decode = new ClassificationDecode();

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
        return this.decode;
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
        return this.classificationSource[this.decode.author];
    }

    /**
     * Return the classification algorithm
     */
    getClassifierAlgorithm(){
        return this.classificationSource[this.decode.classificationAlgorithm];
    }

    /**
     * Return the pre processement techniques used
     */
    getPreProcessementTechniquesUsed(){
        return this.classificationSource[this.decode.preProcTechniquesUsed];
    }

    /**
     * Return the pre processement techniques used
     */
    getPosProcessementTechniquesUsed(){
        return this.classificationSource[this.decode.postProcTechniquesUsed];
    }

    /**
     * Return the collected date of inputs (satelite images)
     */
    getCollectedDate(){
        return this.classificationSource[this.decode.collectedDate];
    }

    /**
     * Return the classification date
     */
    getClassificationDate(){
        return this.classificationSource[this.decode.classificationDate];
    }

    /**
     * Return the class stats of classification
     */
    getClassStats() {
        return this.classificationStats[this.decode.classStats];
    }
    
    /**
     * Return the global stats of classification
     */
    getGlobalStats() {
        return this.classificationStats[this.decode.globalStats];
    }

    /**
     * Return the properties / stats of each polygon
     */
    getPropertiesOfPolygon(index) {
        return this.features[index][this.decode.polygonProperties];
    }

    getColorOfClass(classId){
        var colorDict = this.classificationStyle[this.decode.color];
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