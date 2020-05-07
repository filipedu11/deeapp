import { LayerEntity } from './LayerEntity';

export class EvaluationEntity extends LayerEntity{

    constructor(layerID, layerName, layerDescription, 
        layerRasterFile, layerSource, layerStats, layerStyle, features, classNames, geojsonFile, validationLayer, classificationLayer){
        super(layerID, layerName, layerDescription, 
            layerRasterFile, layerSource, layerStats, layerStyle, features, classNames, geojsonFile);

        this.validationLayer = validationLayer;
        this.classificationLayer = classificationLayer;
        if (validationLayer && classificationLayer) {
            this.type = 'evaluation';
        } else {
            this.type = 'evaluation_other';
        }
    }
}
