import readFileSync from 'fs';
import readFileAsync from 'fs';

export class ReadFiles{

    constructor(){}

    readRemoteSensingImage(){
        return 'http://127.0.0.1:8080/sentinel2.png';
    }

    // readValidation(){
    //     return JSON.parse(readFileSync('./workspace/static/data/GEE_Burned_Area_Experiments/validation/validation_burned_area_out.geojson', 'utf8').trim());
    // }

    // readClassification(){
    //     return JSON.parse(readFileSync('./workspace/static/data/GEE_Burned_Area_Experiments/classification/classification_continuousNaiveBayes_out.geojson', 'utf8').trim());
    // }

    // readEvaluation(){
    //     return JSON.parse(readFileAsync('./workspace/static/data/GEE_Burned_Area_Experiments/evaluation/validation_burned_area_VS_classification_continuousNaiveBayes_difference_map_out.geojson', 'utf8').trim());
    // }

    readValidation(){
        return JSON.parse(readFileSync('./workspace/static/data/buildings/validation/tomar_GT_group1_classification_reclass_out.geojson', 'utf8').trim());
    }

    readClassification(){
        return JSON.parse(readFileSync('./workspace/static/data/buildings/classification/tomar_boosted_20px_static_group1_classification_reclass_out.geojson', 'utf8').trim());
    }

    readEvaluation(){
        return JSON.parse(readFileAsync('./workspace/static/data/buildings/evaluation/tomar_GT_group1_classification_reclass_VS_tomar_boosted_20px_static_group1_classification_reclass_difference_map_out.geojson', 'utf8').trim());
    }

    // readValidation(){
    //     return JSON.parse(readFileSync('./workspace/static/data/deimos/validation/subset_1_v2_out.geojson', 'utf8').trim());
    // }

    // readClassification(){
    //     return JSON.parse(readFileSync('./workspace/static/data/deimos/classification/subset_1_v1_out.geojson', 'utf8').trim());
    // }

    // readEvaluation(){
    //     return JSON.parse(readFileAsync('./workspace/static/data/deimos/evaluation/subset_1_v2_VS_subset_1_v1_difference_map_out.geojson', 'utf8').trim());
    // }
    
}