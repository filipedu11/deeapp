import { MapViewer } from './entities/MapViewer.js';

export class Main {

    constructor(){

        this.mapViewer = new MapViewer();
        
        this.classificationVector = [];
        this.classificationMap = {};
    }
    
    addClassification(classificationGeojson){
        this.mapViewer.addClassification(classificationGeojson);
    }
}