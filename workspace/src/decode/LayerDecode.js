import { Decode } from './Decode';
import { FeaturesDecode } from './FeaturesDecode';

export class LayerDecode extends Decode{

    constructor(){
        super();

        //GLOBAL VARIABLES
        this.layerID = ['layerID', 'Layer Id'];
        this.layerName = ['layerName', 'Layer Name'];
        this.layerDescription = ['layerDescription', 'Layer Description'];
        this.layerRasterFile = ['layerRasterFile', 'Path to raster layer file'];
        this.layerSource = ['layerSource', 'Layer Source'];
        this.layerStats = ['layerStats', 'Layer Stats'];
        this.layerStyle = ['layerStyle', 'Layer Style'];
        this.features = ['features', 'Features'];
        
        //layerSource OBJECT
        this.author = ['author', 'Author'];
        this.layerAlgorithm = ['classifierAlgorithm', 'Classifier Algorithm'];
        this.preProcTechniquesUsed = ['preProcTechniquesUsed', 'Pre-processment techniques'];
        this.postProcTechniquesUsed = ['postProcTechniquesUsed', 'Post-processment techniques'];
        this.collectedDate = ['collectedDate', 'Satellite Image Collected Date'];
        this.layerDate = ['layerDate', 'Layer Date'];

        // Namos of classes in layer
        this.classNames = ['classNames', 'Class Names'];

        //layerStyle -> color
        this.color = ['color', 'Colors'];

        this.featuresDecode = new FeaturesDecode();
    }
}