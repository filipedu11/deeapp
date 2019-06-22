import readFileSync from 'fs';

export class ReadFiles{

    constructor(){}

    readClassificationExample(){
        return JSON.parse(readFileSync('./workspace/static/data/classification/classification_example.geojson', 'utf8').trim());
    }

    readCountries(){
        return JSON.parse(readFileSync('./workspace/static/data/countries.geojson', 'utf8').trim());
    }
}