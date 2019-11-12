import Highcharts from 'highcharts';
import Highmaps from 'highcharts/modules/map';

Highmaps(Highcharts);

import * as turf from '@turf/turf';

/*eslint no-undef: "error"*/
/*eslint-env node*/
var geojsonRbush = require('geojson-rbush').default;

export class Metrics {

    constructor(){

    }

    computeOA(dataToComputeMetrics){

        var numerator = 0;
        var divisor = 0;
        var lenData = dataToComputeMetrics.length;
        var step = Math.sqrt(lenData) + 1;
        var oa = 0;

        for (let index = 0; index < lenData; index++) {
            const element = dataToComputeMetrics[index];
            
            numerator += (index % step == 0 ? element : 0);
            divisor += element;
        }

        oa = ((numerator / divisor) * 100).toFixed(1);

        return oa;
    }

    computeF1(dataToComputeMetrics, col=0){

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

    computePrecision(dataToComputeMetrics, col=0){

        var numerator = 0;
        var divisor = 0;
        var lenData = dataToComputeMetrics.length;
        var len = Math.sqrt(lenData);
        var startIndex = col * len;
        var precision = 0;

        for (let index = startIndex; index < len*(col+1); index++) {
            const element = dataToComputeMetrics[index];
            numerator += (col == index - startIndex) ? element : 0;
            divisor += element;
        }

        precision = ((numerator / divisor) * 100).toFixed(1);

        return precision;
    }

    computeRecall(dataToComputeMetrics, line=0){

        var numerator = 0;
        var divisor = 0;
        var lenData = dataToComputeMetrics.length;
        var step = Math.sqrt(lenData);
        var recall = 0;
        var startIndex = step - line - 1;

        for (let index = startIndex; index < lenData; index+=step) {
            const element = dataToComputeMetrics[index];
            const isTP = ((startIndex*step) + startIndex%2 == index);

            numerator += isTP ? element : 0;
            divisor += element;
        }

        recall = ((numerator / divisor) * 100).toFixed(1);

        return recall;
    }

}