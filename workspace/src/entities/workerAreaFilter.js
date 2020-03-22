var turf = require('@turf/turf');
var geojsonRbush = require('geojson-rbush').default;

self.addEventListener('message', function(e) {
    var data = e.data;
    var area = computeDataForMetricsGraph(data[0], data[1], data[2]);
    postMessage(area);
}, false);

function computeDataForMetricsGraph(classKeys, features, steps){                  

    let metricsDataGraph = [{
        name: 'Overall Accuracy',
        color: 'rgba(223, 83, 83, .5)',
        data: []
    }, {
        name: 'Recall',
        color: 'rgba(10, 83, 83, .5)',
        data: []
    }, {
        name: 'Precision',
        color: 'rgba(200, 0, 83, .5)',
        data: []
    }, {
        name: 'F1 Score',
        color: 'rgba(40, 50, 200, .5)',
        data: []
    }];

    let len = steps.length;
    let end = 0;
    let start = steps[0];
    let dataArea;

    for (let i = 1; i < len; i++) {

        end = steps[i];
        
        dataArea = calcOccupiedAreaForEachClass(classKeys, features, [start, end]);
        
        const oaValue = computeOA(dataArea);
        const paValue = computeRecall(dataArea);
        const uaValue = computePrecision(dataArea);
        const f1score = computeF1(parseFloat(uaValue), parseFloat(paValue));

        metricsDataGraph[0].data.push([end, isNaN(oaValue) ? 0 : parseFloat(oaValue)]);
        metricsDataGraph[1].data.push([end, isNaN(paValue) ? 0 : parseFloat(paValue)]);
        metricsDataGraph[2].data.push([end, isNaN(uaValue) ? 0 : parseFloat(uaValue)]);
        metricsDataGraph[3].data.push([end, isNaN(f1score) ? 0 : parseFloat(f1score)]);

        end = steps[i];
    }

    return metricsDataGraph;
}

function computeOA(dataToComputeMetrics){

    let numerator = 0;
    let divisor = 0;
    let lenData = dataToComputeMetrics.length;
    let step = Math.sqrt(lenData);
    let oa = 0;

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

function computeF1(precision, recall){

    const f1 = 2 * ((precision*recall)/(precision+recall));
    return f1.toFixed(1);
}

function computeRecall(dataToComputeMetrics, col=1){

    let lenData = dataToComputeMetrics.length;
    let len = Math.sqrt(lenData);
    let startCol = col * len;
    let endCol = (col + 1) * len;
    let precision = 0;

    let numerator = dataToComputeMetrics[startCol + col];
    let divisor = 0;

    for (let index = startCol; index < endCol; index++) {
        divisor += dataToComputeMetrics[index];
    }

    precision = (numerator / divisor) * 100;

    return precision.toFixed(1);
}

function computePrecision(dataToComputeMetrics, line=1){

    let lenData = dataToComputeMetrics.length;
    let step = Math.sqrt(lenData);
    let recall = 0;
    let startLine = line;

    
    let numerator = dataToComputeMetrics[startLine * step + startLine];
    let divisor = 0;

    for (let index = startLine; index < lenData; index+=step) {
        divisor += dataToComputeMetrics[index];
    }

    recall = (numerator / divisor) * 100;

    return recall.toFixed(1);
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
function calcOccupiedAreaForEachClass(classKeys, features, filterAreaInterval){
    let dataArea = [];
    let classIndex = {};

    for (let index = 0, len = classKeys.length ; index < len; index++) {
        const key = classKeys[index];
        classIndex[key] = index;
        dataArea[index] = 0;
    }
    
    let calcArea;
    for (let index = 0, len = features.length; index < len; index++) {
        const polygon = features[index];
        const pos = classIndex[parseInt(polygon['properties']['classId'])];

        //Convert area to hectares (ha = m^2 / 10000)
        calcArea = turf.area(polygon) / 10000;
        if (!filterAreaInterval || filterAreaInterval[0] <= calcArea && calcArea <= filterAreaInterval[1]) {
            dataArea[pos] += calcArea;
        }
    }

    return dataArea;
}