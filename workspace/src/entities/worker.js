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
    let newFeatures = [];

    let dataArea = [];
    let classIndex = {};

    for (let index = 0, len = classKeys.length ; index < len; index++) {
        const key = classKeys[index];
        classIndex[key] = index;
        dataArea[index] = 0;
    }

    let calcArea;

    if(polygonFilter) {

        for (let index = 0, len = features.length; index < len; index++) {
            const polygon = features[index];
            //Convert area to hectares (ha = m^2 / 10000)
            calcArea = turf.area(polygon) / 10000;
            if (!filterAreaInterval || filterAreaInterval[0] <= calcArea && calcArea <= filterAreaInterval[1]) {
                let newPoly = turf.tesselate(polygon).features;

                for (const newP of newPoly) 
                    newP['properties'] = polygon['properties'];
                
                newFeatures.push(...newPoly);
            }
        }
        
        let tree = geojsonRbush();
        let rbush = tree.load(newFeatures);
        let containElements;
        const drawPolygons = turf.tesselate(polygonFilter).features;

        let count = 0;
        let lendra = drawPolygons.length;

        for (const drawP of drawPolygons) {
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
        
    } else {

        for (let index = 0, len = features.length; index < len; index++) {
            const polygon = features[index];
            const pos = classIndex[parseInt(polygon['properties']['classId'])];

            //Convert area to hectares (ha = m^2 / 10000)
            calcArea = turf.area(polygon) / 10000;
            if (!filterAreaInterval || filterAreaInterval[0] <= calcArea && calcArea <= filterAreaInterval[1]) {
                dataArea[pos] += calcArea;
            }
        }
    }

    return dataArea;
}