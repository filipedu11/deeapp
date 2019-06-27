
import { ClassificationDecode } from '../decode/ClassificationDecode';
import { MetadaClassification } from '../panels/classification/MetadataClassification';
import { Legend } from '../panels/Legend';
import { StatsDecode } from '../decode/StatsDecode';

export class Classification{

    constructor(classificationID, classificationName, classificationDescription, 
        classificationRasterFile, classificationSource, classificationStats, classificationStyle, features, geojsonFile) {

        //Set the decode
        this.decodeClassification = new ClassificationDecode();
        this.decodeStats = new StatsDecode();

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
        return this.classificationSource[this.decodeClassification.author[this.decodeClassification.key]];
    }

    /**
     * Return the classification algorithm
     */
    getClassifierAlgorithm(){
        return this.classificationSource[this.decodeClassification.classificationAlgorithm[this.decodeClassification.key]];
    }

    /**
     * Return the pre processement techniques used
     */
    getPreProcessementTechniquesUsed(){
        return this.classificationSource[this.decodeClassification.preProcTechniquesUsed[this.decodeClassification.key]];
    }

    /**
     * Return the pre processement techniques used
     */
    getPosProcessementTechniquesUsed(){
        return this.classificationSource[this.decodeClassification.postProcTechniquesUsed[this.decodeClassification.key]];
    }

    /**
     * Return the collected date of inputs (satelite images)
     */
    getCollectedDate(){
        return this.classificationSource[this.decodeClassification.collectedDate[this.decodeClassification.key]];
    }

    /**
     * Return the classification date
     */
    getClassificationDate(){
        return this.classificationSource[this.decodeClassification.classificationDate[this.decodeClassification.key]];
    }

    /**
     * Return the class stats of classification
     */
    getClassStats() {
        return this.classificationStats[this.decodeStats.classStats[this.decodeStats.key]];
    }
    
    /**
     * Return the global stats of classification
     */
    getGlobalStats() {
        return this.classificationStats[this.decodeStats.globalStats[this.decodeStats.key]];
    }

    /**
     * Return the properties / stats of each polygon
     */
    getPropertiesOfPolygon(index) {
        return this.features[index][this.decodeStats.polygonProperties[this.decodeStats.key]];
    }

    getColorOfClass(classId){
        var colorDict = this.classificationStyle[this.decodeClassification.color[this.decodeClassification.key]];
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