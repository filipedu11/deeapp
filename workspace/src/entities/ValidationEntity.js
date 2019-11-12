import { LayerEntity } from './LayerEntity';

export class ValidationEntity extends LayerEntity{

    constructor(layerID, layerName, layerDescription, 
        layerRasterFile, layerSource, layerStats, layerStyle, features, classNames, geojsonFile){
        super(layerID, layerName, layerDescription, 
            layerRasterFile, layerSource, layerStats, layerStyle, features, classNames, geojsonFile);

        this.type = 'validation';
    }
}
