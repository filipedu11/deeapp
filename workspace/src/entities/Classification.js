
import { ClassificationDecode } from '../decode/ClassificationDecode';


var cDec = new ClassificationDecode();

export class Classification{

    constructor(classificationID, classificationName, classificationDescription, 
        classificationRasterFile, classificationSource, classificationStats, classificationStyle, features, geojsonFile) {
        this.classificationID = classificationID;
        this.classificationName = classificationName;
        this.classificationDescription = classificationDescription;
        this.classificationRasterFile = classificationRasterFile;
        this.classificationSource = classificationSource;
        this.classificationStats = classificationStats;
        this.classificationStyle = classificationStyle;
        this.features = features;
        this.geojsonFile = geojsonFile;
    }

    /**
     * Return the classification name
     */
    getName(){
        return this.classificationName;
    }

    /**
     * Return the class stats of classification
     */
    getClassStats() {
        return this.classificationStats[cDec.classStats];
    }
    
    /**
     * Return the global stats of classification
     */
    getGlobalStats() {
        return this.classificationStats[cDec.globalStats];
    }

    /**
     * Return the properties / stats of each polygon
     */
    getPropertiesOfPolygon(index) {
        return this.features[index][cDec.polygonProperties];
    }

    getColorOfClass(classId){
        var colorDict = this.classificationStyle[cDec.color];
        return colorDict[classId];
    }

    getType(){
        return 'classification';
    }
}