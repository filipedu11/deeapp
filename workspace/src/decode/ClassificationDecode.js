import { Decode } from './Decode';
import { FeaturesDecode } from './FeaturesDecode';
import { StatsDecode } from './StatsDecode';

export class ClassificationDecode extends Decode{

    constructor(){
        super();

        //GLOBAL VARIABLES
        this.classificationID = ['classificationID', 'Classification Id'];
        this.classificationName = ['classificationName', 'Classification Name'];
        this.classificationDescription = ['classificationDescription', 'Classification Description'];
        this.classificationRasterFile = ['classificationRasterFile', 'Path to raster classification file'];
        this.classificationSource = ['classificationSource', 'Classification Source'];
        this.classificationStats = ['classificationStats', 'Classification Stats'];
        this.classificationStyle = ['classificationStyle', 'Classification Style'];
        this.features = ['features', 'Features'];
        
        //classificationSource OBJECT
        this.author = ['author', 'Author'];
        this.classificationAlgorithm = ['classifierAlgorithm', 'Classification Algorithm'];
        this.preProcTechniquesUsed = ['preProcTechniquesUsed', 'Pre-processment techniques'];
        this.postProcTechniquesUsed = ['postProcTechniquesUsed', 'Post-processment techniques'];
        this.collectedDate = ['collectedDate', 'Satellite Image Collected Date'];
        this.classificationDate = ['classificationDate', 'Classification Date'];

        //classificationStyle -> color
        this.color = ['color', 'Colors'];

        this.statsDecode = new StatsDecode();
        this.featuresDecode = new FeaturesDecode();

    }
}