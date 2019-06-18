import { Classification } from '../src/entities/Classification';
import { ClassificationDecode } from '../src/decode/ClassificationDecode';
import { FeaturesDecode } from '../src/decode/FeaturesDecode';
import { strict as assert } from 'assert';
import { readFileSync } from 'fs';


var cDec = new ClassificationDecode();
var fDec = new FeaturesDecode();
var classificationGeojson = JSON.parse(readFileSync('C:/Users/edll/Projectos/deeappGIT/workspace/static/data/classification/classification_example.geojson', 'utf8').trim());

var c1 = new Classification( classificationGeojson[cDec.classificationID], classificationGeojson[cDec.classificationName],
    classificationGeojson[cDec.classificationDescription], classificationGeojson[cDec.classificationRasterFile],
    classificationGeojson[cDec.classificationSource], classificationGeojson[cDec.classificationStats],
    classificationGeojson[cDec.features]);


it('classificationID is equal a classificationID (DECODE)', () => {
    assert.equal(cDec.classificationID, 'classificationID' );
});

it('classificationName is equal a classificationName (DECODE)', () => {
    assert.equal(cDec.classificationName, 'classificationName' );
});

it('classificationDescription is equal a classificationDescription (DECODE)', () => {
    assert.equal(cDec.classificationDescription, 'classificationDescription' );
});

it('classificationRasterFile is equal a classificationRasterFile (DECODE)', () => {
    assert.equal(cDec.classificationRasterFile, 'classificationRasterFile' );
});

it('classificationSource is equal a classificationSource (DECODE)', () => {
    assert.equal(cDec.classificationSource, 'classificationSource' );
});

it('classificationStats is equal a classificationStats (DECODE)', () => {
    assert.equal(cDec.classificationStats, 'classificationStats' );
});

it('features is equal a features (DECODE)', () => {
    assert.equal(cDec.features, 'features' );
});

it('Test method getProperties of Polygon', () => {
    assert.equal(typeof c1.getPropertiesOfPolygon(0)[fDec.classId], 'number');
});
