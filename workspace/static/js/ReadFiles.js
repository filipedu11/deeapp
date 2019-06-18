import readFileSync from 'fs';

export class ReadFiles{

    constructor(){}

    readClassificationExample(){
        return readFileSync('./workspace/static/data/classification/classification_example.geojson', 'utf8');
    }
}