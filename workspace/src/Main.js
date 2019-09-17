import { MapViewer } from './entities/MapViewer.js';

export class Main {

    constructor(){

        this.mapViewer = new MapViewer();

        this.classificationVector = [];
        this.classificationMap = {};
    }

    addClassifiedImage(classifiedImageTiff){
        this.mapViewer.addClassifiedImage(classifiedImageTiff);
    }

    addClassification(classificationGeojson){
        this.mapViewer.addClassification(classificationGeojson);
    }

    addValidation(validationGeojson){
        this.mapViewer.addValidation(validationGeojson);
    }

    addEvaluation(evaluationGeojson){
        this.mapViewer.addEvaluation(evaluationGeojson);
    }
    
}