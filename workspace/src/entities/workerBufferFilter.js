var turf = require('@turf/turf');
var geojsonRbush = require('geojson-rbush').default;

var metricsDataGraph;
self.addEventListener('message', function(e) {
    var data = e.data;
    var area = computeDataForBufferGraph(data[0], data[1], data[2]);
    postMessage(area);
}, false);

function computeDataForBufferGraph(classKeys, features, valFeatures){                  

    if (metricsDataGraph) {
        return metricsDataGraph;
    }

    let step = 0.01;
    let min = 0.01;
    let max = 0.30;
    let dataArea;

    metricsDataGraph = [{
        name: 'Precisão Global (OA)',
        color: 'rgba(223, 83, 83, .5)',
        data: []
    }, {
        name: 'Precisão (UA)',
        color: 'rgba(10, 83, 83, .5)',
        data: []
    }, {
        name: 'Exatidão (PA)',
        color: 'rgba(200, 0, 83, .5)',
        data: []
    }, {
        name: 'F1 Score',
        color: 'rgba(40, 50, 200, .5)',
        data: []
    }];

    console.log('Compute buffer!');
    let polygonBufferFilter = [];
    for (let bufferSize = min; bufferSize <= max; bufferSize+=step) {
        polygonBufferFilter.push(computeBufferAuxiliary(valFeatures, bufferSize));
    }

    let bufferTesselate = [];

    console.log('Buffer tesselated!');
    for (const feat of polygonBufferFilter) {
        const bufTesselate = turf.tesselate(feat).features;
        bufferTesselate.push(bufTesselate);
    }

    let pos = min;
    for (const polyBuffer of bufferTesselate) {

        console.log('Compute buffer: ' + pos);

        dataArea = calcOccupiedAreaForEachClass(
            classKeys, 
            features,
            polyBuffer
        );

        const oaValue = computeOA(dataArea);
        const paValue = computeRecall(dataArea);
        const uaValue = computePrecision(dataArea);
        const f1score = computeF1(dataArea);

        metricsDataGraph[0].data.push([pos, isNaN(oaValue) ? 0 : parseFloat(oaValue)]);
        metricsDataGraph[1].data.push([pos, isNaN(paValue) ? 0 : parseFloat(paValue)]);
        metricsDataGraph[2].data.push([pos, isNaN(uaValue) ? 0 : parseFloat(uaValue)]);  
        metricsDataGraph[3].data.push([pos, isNaN(f1score) ? 0 : parseFloat(f1score)]); 

        pos+=step;
    }

    return metricsDataGraph;
}

function computeBufferAuxiliary(valFeatures, value) {

    let mainFeats = [];
    var options = {tolerance: 0.0005
        , highQuality: false, mutate: false};

    for (let index = 0, len = valFeatures.length; index < len; ++index) {
        const feat = valFeatures[index];
        
        if (feat.properties.classId == 1) {

            let featBuffer;
            let bufferLine = feat;
            featBuffer = turf.simplify(turf.polygonToLine(feat), options);
            bufferLine = turf.buffer(featBuffer, value);
            
            mainFeats.push(bufferLine);
        }
    }

    return turf.union.apply(this, mainFeats);
}

function computeOA(dataToComputeMetrics){

    var numerator = 0;
    var divisor = 0;
    var lenData = dataToComputeMetrics.length;
    var step = Math.sqrt(lenData);
    var oa = 0;

    let diag = 0;

    for (let index = 0; index < lenData; index++) {
        const element = dataToComputeMetrics[index];

        if (index % step == 0) {
            numerator += dataToComputeMetrics[index + diag];
            diag+=1;
        }

        divisor += element;
    }

    oa = ((numerator / divisor) * 100).toFixed(1);

    return oa;
}

function computeF1(dataToComputeMetrics, col=0){

    var numerator = 0;
    var divisor = 0;
    var lenData = dataToComputeMetrics.length;
    var step = Math.sqrt(lenData) + 1;
    var f1 = 0;

    for (let index = 0; index < lenData; index++) {
        const element = dataToComputeMetrics[index];
        
        numerator += (col * step == index) ? element*2 : 0;
        divisor += (index % step != 0 ? element : 0);
    }

    f1 = ((numerator / (divisor + numerator)) * 100).toFixed(1);

    return f1;
}

function computePrecision(dataToComputeMetrics, col=1){

    var lenData = dataToComputeMetrics.length;
    var len = Math.sqrt(lenData);
    var startCol = col * len;
    var endCol = (col + 1) * len;
    var precision = 0;

    var numerator = dataToComputeMetrics[startCol + col];
    var divisor = 0;

    for (let index = startCol; index < endCol; index++) {
        divisor += dataToComputeMetrics[index];
    }

    precision = ((numerator / divisor) * 100).toFixed(1);

    return precision;
}

function computeRecall(dataToComputeMetrics, line=1){

    var lenData = dataToComputeMetrics.length;
    var step = Math.sqrt(lenData);
    var recall = 0;
    var startLine = line;

    
    var numerator = dataToComputeMetrics[startLine * step + startLine];
    var divisor = 0;

    for (let index = startLine; index < lenData; index+=step) {
        divisor += dataToComputeMetrics[index];
    }

    recall = ((numerator / divisor) * 100).toFixed(1);

    return recall;
}

/**
 * Compute the data for the error matrix according with:
 * 
 *  1. Selected interval area
 *  2. Polygon draw
 * 
 * calcOccupiedAreaForEachClass(dataLayer) -> data for error matrix without filter
 * calcOccupiedAreaForEachClass(dataLayer, filterAreaInterval, polygonFilter) -> data for error matrix with filter
 * 
 * @param {*} dataLyr 
 * @param {*} filterAreaInterval 
 * @param {*} polygonFilter 
 */    
function calcOccupiedAreaForEachClass(classKeys, features, polygonBufferTesselated){

    let dataArea = [];
    var classIndex = {};

    for (let index = 0, len = classKeys.length ; index < len; index++) {
        const key = classKeys[index];
        classIndex[key] = index;
        dataArea[index] = 0;
    }

    let calcArea;
    let tree = geojsonRbush();
    const treeFeat= tree.load(features);

    let poly = polygonBufferTesselated[0];
    const factorDivision = 10;
    let foundFeats;

    for (let j = 1, len = polygonBufferTesselated.length; j < len; ++j) {

        if (j%factorDivision != 0) { //Construct poly to eval
            poly = turf.union(poly, polygonBufferTesselated[j]);
        }
        else {
            try {
                foundFeats = treeFeat.search(poly).features;
                for (const fFeat of foundFeats) {
                    const pos = classIndex[parseInt(fFeat['properties']['classId'])];
                    const intersectArea = turf.intersect(fFeat, poly);
                    //Convert area to hectares (ha = m^2 / 10000)
                    calcArea = intersectArea ? turf.area(intersectArea) / 10000 : 0;
                    dataArea[pos] = dataArea[pos] + calcArea;
                }

                poly = polygonBufferTesselated[j]; 
            } catch (error) {
                poly = turf.union(poly, polygonBufferTesselated[j]);
            }
        }
    }

    foundFeats = treeFeat.search(poly).features;

    for (const fFeat of foundFeats) {
        const pos = classIndex[parseInt(fFeat['properties']['classId'])];
        const intersectArea = turf.intersect(fFeat, poly);
        //Convert area to hectares (ha = m^2 / 10000)
        calcArea = intersectArea ? turf.area(intersectArea) / 10000 : 0;

        dataArea[pos] = dataArea[pos] + calcArea;
    }
    
    return dataArea;
}