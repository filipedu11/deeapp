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
        
        dataArea = calcOccupiedAreaForEachClass(classKeys, features, [start, end], null);
        
        const oaValue = computeOA(dataArea);
        const paValue = computeRecall(dataArea);
        const uaValue = computePrecision(dataArea);
        const f1score = computeF1(dataArea);

        metricsDataGraph[0].data.push([end, isNaN(oaValue) ? 0 : parseFloat(oaValue)]);
        metricsDataGraph[1].data.push([end, isNaN(paValue) ? 0 : parseFloat(paValue)]);
        metricsDataGraph[2].data.push([end, isNaN(uaValue) ? 0 : parseFloat(uaValue)]);
        metricsDataGraph[3].data.push([end, isNaN(f1score) ? 0 : parseFloat(f1score)]);

        end = steps[i];
    }

    return metricsDataGraph;
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
function calcOccupiedAreaForEachClass(classKeys, features, filterAreaInterval, polygonFilter){
    var newFeatures = [];

    var dataArea = [];
    var classIndex = {};

    for (let index = 0, len = classKeys.length ; index < len; index++) {
        const key = classKeys[index];
        classIndex[key] = index;
        dataArea[index] = 0;
    }

    var calcArea;

    if(polygonFilter) {

        for (let index = 0, len = features.length; index < len; index++) {
            const polygon = features[index];
            //Convert area to hectares (ha = m^2 / 10000)
            calcArea = turf.area(polygon) / 10000;
            if (!filterAreaInterval || filterAreaInterval[0] <= calcArea && calcArea <= filterAreaInterval[1]) {
                newFeatures.push(polygon);
            }
        }

        var tree = geojsonRbush();
        var rbush = tree.load(newFeatures);
        let containElements;

        var drawPolygons = turf.tesselate(polygonFilter).features;
        let lenDrawPolys = drawPolygons.length;
        let poly = lenDrawPolys > 0 ? drawPolygons[0] : null;
        const factorDivision = 20;

        for (let j = 1; j < lenDrawPolys; ++j) {
        
            if (j%factorDivision != 0) { //Construct poly to eval
                poly = turf.union(poly, drawPolygons[j]);
            }
            else { //Eval the polygon 
                containElements = rbush.search(poly).features;
            
                for (let index = 0, len = containElements.length; index < len && poly; ++index) {

                    const polygon = containElements[index];
                    const pos = classIndex[parseInt(containElements[index]['properties']['classId'])];

                    const intersectArea = turf.intersect(polygon, poly);

                    //Convert area to hectares (ha = m^2 / 10000)
                    calcArea = intersectArea ? turf.area(intersectArea) / 10000 : 0;

                    dataArea[pos] = dataArea[pos] != null ? 
                        dataArea[pos] + calcArea : calcArea;
                }

                poly = drawPolygons[j];
            }
        }
    
        containElements = rbush.search(poly).features;

        for (let index = 0, len = containElements.length; index < len && poly; ++index) {

            const polygon = containElements[index];
            const pos = classIndex[parseInt(containElements[index]['properties']['classId'])];

            const intersectArea = turf.intersect(polygon, poly);

            //Convert area to hectares (ha = m^2 / 10000)
            calcArea = intersectArea ? turf.area(intersectArea) / 10000 : 0;
        
            dataArea[pos] = dataArea[pos] != null ? 
                dataArea[pos] + calcArea : calcArea;
        }

    } else {

        for (let index = 0, len = features.length; index < len; index++) {
            const polygon = features[index];
            const pos = classIndex[parseInt(features[index]['properties']['classId'])];

            //Convert area to hectares (ha = m^2 / 10000)
            calcArea = turf.area(polygon) / 10000;
            if (!filterAreaInterval || filterAreaInterval[0] <= calcArea && calcArea <= filterAreaInterval[1]) {
                dataArea[pos] = dataArea[pos] != null ? 
                    dataArea[pos] + calcArea : calcArea;
            }
        }
    }

    return dataArea;
}