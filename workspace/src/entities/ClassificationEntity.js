import { LayerEntity } from './LayerEntity';

export class ClassificationEntity extends LayerEntity{

    constructor(layerID, layerName, layerDescription, 
        layerRasterFile, layerSource, layerStats, layerStyle, features, classNames, geojsonFile, type){
        super(layerID, layerName, layerDescription, 
            layerRasterFile, layerSource, layerStats, layerStyle, features, classNames, geojsonFile, type);

        this.type = 'classification';
    }
}
