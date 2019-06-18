import { MapViewer } from './entities/MapViewer.js';

import { Classification } from './entities/Classification';
import { ClassificationDecode } from './decode/ClassificationDecode';

export class Main {

    constructor(){

        this.mapViewer = new MapViewer();
        
        this.classificationVector = [];
        this.classificationMap = {};
    }
    
    addClassification(type, classificationGeojson){
        this.type = type;
        this.classificationGeojson = classificationGeojson;
    }
}