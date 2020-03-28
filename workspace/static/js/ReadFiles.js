import readFileSync from 'fs';
import readFileAsync from 'fs';

export class ReadFiles{

    constructor(){}

    readClassifiedImage(){
        return 'http://127.0.0.1:8080/classifiedImage.png';
    }

    readValidation(){
        return JSON.parse(readFileSync('./workspace/static/data/GEE_Burned_Area_Experiments/validation/validation_burned_area_out.geojson', 'utf8').trim());
    }

    readClassification(){
        return JSON.parse(readFileSync('./workspace/static/data/GEE_Burned_Area_Experiments/classification/classification_continuousNaiveBayes_out.geojson', 'utf8').trim());
    }

    readEvaluation(){
        return JSON.parse(readFileAsync('./workspace/static/data/GEE_Burned_Area_Experiments/evaluation/validation_burned_area_VS_classification_continuousNaiveBayes_difference_map_out.geojson', 'utf8').trim());
    }
}