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
    let max = 0.50;
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

    let polygonBufferFilter = [];
    for (let bufferSize = min; bufferSize <= max; bufferSize+=step) {
        polygonBufferFilter.push(computeBufferAuxiliary(valFeatures, bufferSize));
    }

    let bufferTesselate = [];

    for (const feat of polygonBufferFilter) {
        const bufTesselate = turf.tesselate(feat).features;
        bufferTesselate.push(bufTesselate);
    }

    let pos = min;
    for (const polyBuffer of bufferTesselate) {

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
    var options = {tolerance: 0.0001
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
 * calcOccupiedAreaForEachClass(dataLayer, filterAreaInterval, polygonBufferTesselated) -> data for error matrix with filter
 * 
 * @param {*} dataLyr 
 * @param {*} filterAreaInterval 
 * @param {*} polygonBufferTesselated 
 */    
function calcOccupiedAreaForEachClass(classKeys, features, polygonBufferTesselated){
    let dataArea = [];
    let classIndex = {};

    for (let index = 0, len = classKeys.length ; index < len; index++) {
        const key = classKeys[index];
        classIndex[key] = index;
        dataArea[index] = 0;
    }

    let calcArea;

    let newFeatures = [];

    for (let index = 0, len = features.length; index < len; index++) {
        const polygon = features[index];
        //Convert area to hectares (ha = m^2 / 10000)
        calcArea = turf.area(polygon) / 10000;
        let newPoly = turf.tesselate(polygon).features;

        for (const newP of newPoly) 
            newP['properties'] = polygon['properties'];
            
        newFeatures.push(...newPoly);
    }
    
    let tree = geojsonRbush();
    let rbush = tree.load(newFeatures);
    let containElements;
    
    for (const drawP of polygonBufferTesselated) {
        const drawPArea = turf.area(drawP);
        containElements = rbush.search(drawP).features;

        for (let index = 0, len = containElements.length; index < len && drawP; ++index) {
            calcArea = 0;
            const polygon = containElements[index];
            const pos = classIndex[parseInt(polygon['properties']['classId'])];
            try {
                calcArea = drawPArea - turf.area(turf.difference(drawP, polygon));
            // eslint-disable-next-line no-empty
            } catch (error) {
            }

            dataArea[pos] += calcArea;
        }
    }
    //Convert area to hectares (ha = m^2 / 10000)
    for(var i = 0, length = dataArea.length; i < length; i++){
        dataArea[i] = dataArea[i]/10000;
    }
    return dataArea;
}