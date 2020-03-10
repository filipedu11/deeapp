var turf = require('@turf/turf');
var geojsonRbush = require('geojson-rbush').default;

self.addEventListener('message', function(e) {
    var data = e.data;
    var area = calcOccupiedAreaForEachClass(data[0], data[1], data[2], data[3]);
    postMessage(area);
}, false);

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
        const factorDivision = 10;

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
            console.log(j + ' : ' + lenDrawPolys);
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

            console.log(dataArea);

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

    console.log(dataArea);
    
    return dataArea;
}