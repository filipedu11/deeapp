
export class ClassificationDecode{

    constructor(){

        //GLOBAL VARIABLES
        this.classificationID = "classificationID";
        this.classificationName = "classificationName";
        this.classificationDescription = "classificationDescription";
        this.classificationRasterFile = "classificationRasterFile";
        this.classificationSource = "classificationSource";
        this.classificationStats = "classificationStats";
        this.features = "features";
        
        //classificationSource OBJECT
        this.author = "author";
        this.classificationAlgorithm = "classifierAlgorithm";
        this.preProcTechniquesUsed = "preProcTechniquesUsed";
        this.postProcTechniquesUsed = "postProcTechniquesUsed";
        this.collectedDate = "collectedDate";
        this.classificationDate = "classificationDate";

        //classificationStats OBJECT
        this.classStats = "classStats";
        this.globalStats = "globalStats";

        //classificationStats -> classStats OBJECT
        this.classID = "classID";
        this.className = "className";
        this.numberOfPolygons = "numberOfPolygons";

        //classificationStats -> globalStats OBJECT
        this.numberTotalOfPolygons = "numberTotalOfPolygons";
        
        //classificationStats -> classStats || globalStats OBJECT
        this.statsAreaInPixel = "statsAreaInPixel";
        this.statsAreaInHectare = "statsAreaInHectare";
        this.statsPerimeterInMeters = "statsPerimeterInMeters";

        //classificationStats -> classStats -> statsAreaInPixel OBJECT
        this.totalAreaInPixels = "totalAreaInPixels";
        this.meanOfFeaturesAreaInPixels = "meanOfFeaturesAreaInPixels";
        this.stdOfFeaturesAreaInPixels = "stdOfFeaturesAreaInPixels";
        this.medianOfFeaturesAreaInPixels = "medianOfFeaturesAreaInPixels";
        this.minFeatureAreaInPixels = "minFeatureAreaInPixels";
        this.maxFeatureAreaInPixels = "maxFeatureAreaInPixels";

        //classificationStats -> classStats -> statsAreaInHectare OBJECT
        this.totalAreaInHectare = "totalAreaInHectare";
        this.meanOfFeaturesAreaInHectare = "meanOfFeaturesAreaInHectare";
        this.stdOfFeaturesAreaInHectare = "stdOfFeaturesAreaInHectare";
        this.medianOfFeaturesAreaInHectare = "medianOfFeaturesAreaInHectare";
        this.minFeatureAreaInHectare = "minFeatureAreaInHectare";
        this.maxFeatureAreaInHectare = "maxFeatureAreaInHectare";

        //classificationStats -> classStats -> statsPerimeterInMeters OBJECT
        this.totalPerimeterInMeters = "totalPerimeterInMeters";
        this.meanOfFeaturesPerimeterInMeters = "meanOfFeaturesPerimeterInMeters";
        this.stdOfFeaturesPerimeterInMeters = "stdOfFeaturesPerimeterInMeters";
        this.medianOfFeaturesPerimeterInMeters = "medianOfFeaturesPerimeterInMeters";
        this.minFeaturePerimeterInMeters = "minFeaturePerimeterInMeters";
        this.maxFeaturePerimeterInMeters = "maxFeaturePerimeterInMeters";

        //classificationStats -> globalStats -> statsAreaInPixel OBJECT
        this.totalAreaInPixels = "totalAreaInPixels";
        this.meanOfFeaturesAreaInPixels = "meanOfFeaturesAreaInPixels";
        this.meanStdOfFeaturesAreaInPixels = "meanStdOfFeaturesAreaInPixels";
        this.meanOfmedianOfFeaturesAreaInPixels = "meanOfmedianOfFeaturesAreaInPixels";
        this.minFeatureAreaInPixels = "minFeatureAreaInPixels";
        this.maxFeatureAreaInPixels = "maxFeatureAreaInPixels";

        //classificationStats -> globalStats -> statsAreaInHectare OBJECT
        this.totalAreaInHectare = "totalAreaInHectare";

        //classificationStats -> globalStats -> statsPerimeterInMeters OBJECT
        this.totalPerimeterInMeters = "totalPerimeterInMeters";
    }
}