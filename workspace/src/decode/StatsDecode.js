import { Decode } from './Decode';

export class StatsDecode extends Decode {

    constructor(){
        super();

        //classificationStats OBJECT
        this.classStats = ['classStats', 'Class Stats'];
        this.globalStats = ['globalStats', 'Classification Stats'];

        //classificationStats -> classStats OBJECT
        this.classID = ['classId', 'Class id'];
        this.className = ['className', 'Class name'];
        this.numberOfPolygons = ['numberOfPolygons', 'Number of polygons'];

        //classificationStats -> globalStats OBJECT
        this.meanNumberOfPolygons = ['meanNumberOfPolygons', 'Mean number of polygons'];

        //classificationStats -> classStats || globalStats OBJECT
        this.statsAreaInPixel = ['statsAreaInPixel', 'Stats in pixel'];
        this.statsAreaInHectare = ['statsAreaInHectare', 'Stats in hectare'];
        this.statsPerimeterInMeters = ['statsPerimeterInMeters', 'Perimeter in meters'];

        //classificationStats -> classStats -> statsAreaInPixel OBJECT
        this.totalAreaInPixels = ['totalAreaInPixels', 'Total Area (pixels)'];
        this.meanOfFeaturesAreaInPixels = ['meanOfFeaturesAreaInPixels', 'Mean area of polygons (pixels)'];
        this.stdOfFeaturesAreaInPixels = ['stdOfFeaturesAreaInPixels', 'Standard deviation area of polygons (pixels)'];
        this.medianOfFeaturesAreaInPixels = ['medianOfFeaturesAreaInPixels', 'Median area of polygons (pixels)'];
        this.minFeatureAreaInPixels = ['minFeatureAreaInPixels', 'Minimum area of polygon (pixels)'];
        this.maxFeatureAreaInPixels = ['maxFeatureAreaInPixels', 'Maximum area of polygon (pixels)'];

        //classificationStats -> classStats -> statsAreaInHectare OBJECT
        this.totalAreaInHectare = ['totalAreaInHectare', 'Total Area (hectare)'];
        this.meanOfFeaturesAreaInHectare = ['meanOfFeaturesAreaInHectare', 'Mean area of polygons (hectare)'];
        this.stdOfFeaturesAreaInHectare = ['stdOfFeaturesAreaInHectare', 'Standard deviation area of polygons (hectare)'];
        this.medianOfFeaturesAreaInHectare = ['totalAreaInPixels', 'Median area of polygons (hectare)'];
        this.minFeatureAreaInHectare = ['minFeatureAreaInHectare', 'Minimum area of polygon (hectare)'];
        this.maxFeatureAreaInHectare = ['maxFeatureAreaInHectare', 'Maximum area of polygon (hectare)'];

        //classificationStats -> classStats -> statsPerimeterInMeters OBJECT
        this.totalPerimeterInMeters = ['totalPerimeterInMeters', 'Total Perimeter (meters)'];
        this.meanOfFeaturesPerimeterInMeters = ['meanOfFeaturesPerimeterInMeters', 'Mean perimeter of polygons (meters)'];
        this.stdOfFeaturesPerimeterInMeters = ['stdOfFeaturesPerimeterInMeters', 'Standard deviation perimeter of polygons (meters)'];
        this.medianOfFeaturesPerimeterInMeters = ['medianOfFeaturesPerimeterInMeters', 'Median perimeter of polygons (meters)'];
        this.minFeaturePerimeterInMeters = ['minFeaturePerimeterInMeters', 'Minimum perimeter of polygon (meters)'];
        this.maxFeaturePerimeterInMeters = ['maxFeaturePerimeterInMeters', 'Maximum perimeter of polygon (meters)'];

        //classificationStats -> globalStats -> statsAreaInPixel OBJECT
        this.meanAreaInPixels = ['meanAreaInPixels', 'Mean area of polygons (pixels)'];
        this.meanOfmeanOfFeaturesAreaInPixels = ['meanOfmeanOfFeaturesAreaInPixels', 'Mean of mean area of polygons (pixels)'];
        this.meanStdOfFeaturesAreaInPixels = ['meanStdOfFeaturesAreaInPixels', 'Mean of standard deviation area of polygons (pixels)'];
        this.meanOfmedianOfFeaturesAreaInPixels = ['meanOfmedianOfFeaturesAreaInPixels', 'Mean of median area of polygons (pixels)'];
        this.minFeatureAreaInPixels = ['minFeatureAreaInPixels', 'Mean of minimum area of polygons (pixels)'];
        this.maxFeatureAreaInPixels = ['maxFeatureAreaInPixels', 'Mean of maximum area of polygons (pixels)'];

        //classificationStats -> globalStats -> statsAreaInHectare OBJECT
        this.meanAreaInHectare = ['totalAreaInHectare', 'Mean area of polygons (hectare)'];

        //classificationStats -> globalStats -> statsPerimeterInMeters OBJECT
        this.meanPerimeterInMeters = ['totalPerimeterInMeters', 'Mean perimeter of polygons (meters)'];


        this.polygonProperties = ['properties', 'Properties'];
    }
}