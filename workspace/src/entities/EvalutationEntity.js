import { LayerEntity } from './LayerEntity';

export class EvaluationEntity extends LayerEntity{

    constructor(layerID, layerName, layerDescription, 
        layerRasterFile, layerSource, layerStats, layerStyle, features, classNames, geojsonFile, type, validationLayer, classificationLayer){
        super(layerID, layerName, layerDescription, 
            layerRasterFile, layerSource, layerStats, layerStyle, features, classNames, geojsonFile, type);

        this.validationLayer = validationLayer;
        this.classificationLayer = classificationLayer;
        this.type = 'evaluation';
    }
}
