import readFileSync from 'fs';
import readFileAsync from 'fs';

export class ReadFiles{

    constructor(){}
    
    // readValidationBurnedArea(){
    //     return JSON.parse(readFileSync('./workspace/static/data/classification/GEE_Burned_Area_Experiments/validation_burned_area_out.geojson', 'utf8').trim());
    // }

    // readClassificationCart(){
    //     return JSON.parse(readFileSync('./workspace/static/data/classification/GEE_Burned_Area_Experiments/classification_cart_out.geojson', 'utf8').trim());
    // }

    // readClassificationContinuousNaiveBayes(){
    //     return JSON.parse(readFileSync('./workspace/static/data/classification/GEE_Burned_Area_Experiments/classification_continuousNaiveBayes_out.geojson', 'utf8').trim());
    // }

    readEvaluationContinuousNaiveBayes(){
        return JSON.parse(readFileAsync('./workspace/static/data/classification/GEE_Burned_Area_Experiments/classification_continuousNaiveBayes_VS_validation_burned_area_difference_map_out.geojson', 'utf8').trim());
    }

    readEvaluationRandomForest(){
        return JSON.parse(readFileAsync('./workspace/static/data/classification/GEE_Burned_Area_Experiments/classification_randomForest_VS_validation_burned_area_difference_map_out.geojson', 'utf8').trim());
    }
    
    // readEvaluationGmoMaxEnt(){
    //     return JSON.parse(readFileAsync('./workspace/static/data/classification/GEE_Burned_Area_Experiments/classification_gmoMaxEnt_VS_validation_burned_area_difference_map_out.geojson', 'utf8').trim());
    // }

    // readTestClassification(){
    //     return JSON.parse(readFileAsync('./workspace/static/data/classification/GEE_Burned_Area_Experiments/classification_out.geojson', 'utf8').trim());
    // }
}