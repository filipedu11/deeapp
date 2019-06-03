
import { ClassificationDecode } from "../decode/ClassificationDecode";

var cDec = new ClassificationDecode();

export class Classification{

    constructor(classificationID, classificationName, classificationDescription, 
        classificationRasterFile, classificationSource, classificationStats, features){
        this.classificationID = classificationID;
        this.classificationName = classificationName;
        this.classificationDescription = classificationDescription;
        this.classificationRasterFile = classificationRasterFile;
        this.classificationSource = classificationSource;
        this.classificationStats = classificationStats;
        this.features = features;
    }

    /**
     * Return the class stats of classification
     */
    getClassStats(){
        return this.classificationStats[cDec.classStats];
    }
    
    /**
     * Return the global stats of classification
     */
    getGlobalStats(){
        return this.classificationStats[cDec.globalStats];
    }

    /**
     * Return the properties / stats of each polygon
     */
    getPropertiesOfPolygon(index){
        return this.features[index][cDec.polygonProperties];
    }
}