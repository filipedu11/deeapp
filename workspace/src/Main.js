import { MapViewer } from './entities/MapViewer.js';

export class Main {

    constructor(){

        this.mapViewer = new MapViewer();
    }

    addRemoteSensingImage(remoteSensingImage){
        this.mapViewer.addRemoteSensingImage(remoteSensingImage);
    }

    addEvaluation(evaluationGeojson, validationGeojson, classificationGeojson){
        
        let validation, classification;

        if(validationGeojson && classificationGeojson) {
            validation = this.mapViewer.addValidation(validationGeojson);
            classification = this.mapViewer.addClassification(classificationGeojson);
        }
        
        this.mapViewer.addEvaluation(evaluationGeojson, validation, classification);
    }
    
}