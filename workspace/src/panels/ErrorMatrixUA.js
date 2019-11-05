import Highcharts from 'highcharts';
import Highmaps from 'highcharts/modules/map';

Highmaps(Highcharts);

import * as turf from '@turf/turf';

/*eslint no-undef: "error"*/
/*eslint-env node*/
var geojsonRbush = require('geojson-rbush').default;

export class ErrorMatrixUA {

    constructor(){
        this.content = document.getElementById('content-error-matrix-ua');
        this.info = document.getElementById('info-error-matrix-ua');
        this.infoErrorMatrixGlobal = document.createElement('div');
        this.infoErrorMatrixGlobal.id = 'info-error-matrix-global-ua';
        this.infoErrorMatrixFiltered = document.createElement('div');
        this.infoErrorMatrixFiltered.id = 'info-error-matrix-filtered-ua';
    }

    clearStatsPanel(){
        this.content.innerHTML = '';
        this.info.innerHTML = '';

        this.lastX = -1;
        this.lastY = -1;
    }

    createConfusionMatrix(lyr, dataLyr){
        
        var confusionMatrix = document.getElementById('confusion-matrix-global-ua');
        
        if ( !confusionMatrix ) {
            confusionMatrix = document.createElement('div');
            confusionMatrix.id = 'confusion-matrix-global-ua';
            confusionMatrix.style.width = '100%';
            confusionMatrix.style.marginBottom = '5px';
            confusionMatrix.style.marginTop = '5px';

            this.content.appendChild(confusionMatrix);
        }

        var xCategories, yCategories, data;
        
        var dataForErrorMatrix = this.getDataForErrorMatrix(dataLyr);
        var title = dataLyr.getName().split(' | ');
        var xAxisTitle = '<b>' + title[0] + '</b>';
        var yAxisTitle = '<b>' + title[1] + '</b>';

        xCategories = dataForErrorMatrix[0];
        yCategories = dataForErrorMatrix[1];
        data = dataForErrorMatrix[2];
        var resultLabel = dataLyr.getBinaryClassNamesForErrorMatrix();

        confusionMatrix.style.height = xCategories.length * 125 + 'px';

        this.confusionMatrixHigh = Highcharts.chart('confusion-matrix-global-ua', {
            chart: {
                type: 'heatmap',
                plotBorderWidth: 0,
                borderColor: 'rgba(255,255,255,0)',
                backgroundColor:'rgba(255, 255, 255, 0.0)'
            },
            title: {
                text: '<b>Sem Filtros</b>'
            },
            xAxis: {
                categories: xCategories,
                opposite: true,             
                title: {
                    enabled: true,
                    text: xAxisTitle
                },           
            },
            yAxis: {           
                title: {
                    enabled: true,
                    text: yAxisTitle
                },
                categories: yCategories,
            },
            colorAxis: {
                min: 0,
                minColor: 'rgba(255,255,255,0)',
                maxColor: 'rgba(255,255,255,0)', 
            },
            legend: {
                enabled: false
            },
            tooltip: {
                formatter: function () {
                    var binaryCode = this.point.x + '' + this.point.y;

                    return '<b>Resultado:</b> ' + resultLabel[binaryCode] + '<br/><b>Classe de classificação:</b> ' + this.series.xAxis.categories[this.point.x] + '<br/><b>Classe de validação:</b> ' +
                    this.series.yAxis.categories[this.point.y] + '<br><b>Área ocupada:</b> ' + this.point.value + ' %';
                }
            },
            series: [{
                name: 'Confusion matrix',
                borderWidth: 0,
                data: data,
                dataLabels: {
                    enabled: true,
                    formatter: function () { 
                        return this.point.value + ' %';
                    },
                    style: {
                        fontSize: '14px'
                    }
                }
            }],
            exporting : {
                buttons: {
                    contextButton: {
                        symbolFill: 'rgba(255,255,255,0)'
                    }
                }
            }
        });
    }

    getDataForErrorMatrix(dataLyr){
        var features = dataLyr.getFeatures();
        var classNames = dataLyr.getIndividualClassNames();
        var classKeys = dataLyr.getKeysOfClasses();

        var dataArea = [];
        var classIndex = {};

        for (let index = 0, len = classKeys.length ; index < len; index++) {
            const key = classKeys[index];
            classIndex[key] = index;
        }

        for (let index = 0, len = features.length; index < len; index++) {
            const polygon = features[index]['geometry']['coordinates'];
            const pos = classIndex[parseInt(features[index]['properties']['classId'])];

            //Convert area to hectares (ha = m^2 / 10000)
            dataArea[pos] = dataArea[pos] != null ? 
                dataArea[pos] + turf.area(turf.polygon(polygon))/10000 : turf.area(turf.polygon(polygon))/10000;
        }

        var yCategories = Object.keys(classNames);
        var xCategories = yCategories.slice().reverse();
        var colors = dataLyr.getClassColors();

        var dataErrorMatrix = this.computeDataToErrorMatrix(yCategories, xCategories, dataArea, colors);

        return [xCategories, yCategories, dataErrorMatrix];
    }

    computeDataToErrorMatrix(yCategories, xCategories, dataArea, colors){
        
        var dataErrorMatrix = [];
        var dataToComputeMetrics = [];

        var lenJ = yCategories.length;
        var lenI = xCategories.length;

        if ( this.lastX == -1 && this.lastY == -1) {
            this.lastX = 0;
            this.lastY = lenJ - 1;
        }

        //Construct classes data for error matrix  with horizontal total
        var count = 3;
        var totalArea = [0, 0];
        for (let horizontal = 0; horizontal < lenI; horizontal++) {
            for (let vertical = 0; vertical < lenJ ; vertical++) {
                const value = dataArea[count] ? dataArea[count] : 0;
                dataErrorMatrix.push(
                    {
                        x: horizontal,
                        y: lenJ - (vertical + 1),
                        color: colors[count + 1], 
                        value: value,
                    }
                );
                dataToComputeMetrics.push(value);
                count -= 1;
                totalArea[horizontal] += value;
            }
        }

        dataErrorMatrix[0].value = parseFloat((dataErrorMatrix[0].value / totalArea[0] * 100).toFixed(2));
        dataErrorMatrix[1].value = parseFloat((dataErrorMatrix[1].value / totalArea[0] * 100).toFixed(2));
        dataErrorMatrix[2].value = parseFloat((dataErrorMatrix[2].value / totalArea[1] * 100).toFixed(2));
        dataErrorMatrix[3].value = parseFloat((dataErrorMatrix[3].value / totalArea[1] * 100).toFixed(2));

        return dataErrorMatrix;
    }

    createConfusionMatrixFiltered(dataLyr, featsUnselect, polygonFilter){

        var confusionMatrix = document.getElementById('confusion-matrix-filtered-ua');

        if ( !confusionMatrix ) {
            confusionMatrix = document.createElement('div');
            confusionMatrix.id = 'confusion-matrix-filtered-ua';
            confusionMatrix.style.width = '100%';
            confusionMatrix.style.marginBottom = '5px';
            confusionMatrix.style.marginTop = '5px';

            this.content.appendChild(confusionMatrix);
        }

        confusionMatrix.onchange = function(){
            document.getElementById('loader').className = 'inline-block';
        };

        var xCategories, yCategories, data;
        
        var dataForErrorMatrixFiltered = this.getDataForErrorMatrixFiltered(dataLyr, featsUnselect, polygonFilter);
        var title = dataLyr.getName().split(' | ');
        var xAxisTitle = '<b>' + title[0] + '</b>';
        var yAxisTitle = '<b>' + title[1] + '</b>';

        xCategories = dataForErrorMatrixFiltered[0];
        yCategories = dataForErrorMatrixFiltered[1];
        data = dataForErrorMatrixFiltered[2];

        var resultLabel = dataLyr.getBinaryClassNamesForErrorMatrix();

        confusionMatrix.style.height = xCategories.length * 125 + 'px';

        this.confusionMatrixFiltered = Highcharts.chart('confusion-matrix-filtered-ua', {
            chart: {
                type: 'heatmap',
                plotBorderWidth: 1,
                borderColor: 'rgba(255,255,255,0)',
                backgroundColor:'rgba(255, 255, 255, 0.0)'
            },
            title: {
                text: '<b>Com Filtros</b>'
            },
            xAxis: {
                categories: xCategories,
                opposite: true,             
                title: {
                    enabled: true,
                    text: xAxisTitle
                }  
            },
            yAxis: {           
                title: {
                    enabled: true,
                    text: yAxisTitle
                },
                categories: yCategories,
            },
            colorAxis: {
                min: 0,
                minColor: 'rgba(255,255,255,0)',
                maxColor: 'rgba(255,255,255,0)', 
            },
            legend: {
                enabled: false
            },
            tooltip: {
                formatter: function () {
                    var binaryCode = this.point.x + '' + this.point.y;

                    return '<b>Resultado:</b> ' + resultLabel[binaryCode] + '<br/><b>Classe de classificação:</b> ' + this.series.xAxis.categories[this.point.x] + '<br/><b>Classe de validação:</b> ' +
                    this.series.yAxis.categories[this.point.y] + '<br><b>Área em ha:</b> ' + this.point.value;
                }
            },
            series: [{
                name: 'Confusion matrix',
                borderWidth: 0,
                data: data,
                dataLabels: {
                    enabled: true,
                    formatter: function () { 
                        return this.point.value + ' %';
                    },
                    style: {
                        fontSize: '14px'
                    }
                }
            }],
            exporting : {
                buttons: {
                    contextButton: {
                        symbolFill: 'rgba(255,255,255,0)'
                    }
                }
            }
        });
    }

    getDataForErrorMatrixFiltered(dataLyr, featsUnselect, polygonFilter){

        var features = dataLyr.getFeatures();
        var classNames = dataLyr.getIndividualClassNames();
        var classKeys = dataLyr.getKeysOfClasses();

        var dataArea = [];
        var classIndex = {};

        for (let index = 0, len = classKeys.length ; index < len; index++) {
            const key = classKeys[index];
            classIndex[key] = index;
            dataArea[index] = 0;
        }

        var calcArea;
        if(!polygonFilter) {
            for (let index = 0, len = features.length; index < len; index++) {
                if (!featsUnselect[features[index]['properties']['featureId']]) {
                    const polygon = features[index];
                    const pos = classIndex[parseInt(features[index]['properties']['classId'])];

                    //Convert area to hectares (ha = m^2 / 10000)
                    calcArea = turf.area(polygon) / 10000;
                    dataArea[pos] = dataArea[pos] != null ? 
                        dataArea[pos] + calcArea : calcArea;
                }
            }
        } else {

            var tree = geojsonRbush();
            var rbush = tree.load(features);
            var containElements = [];
            if (rbush && polygonFilter) {
                containElements.push(rbush.search(polygonFilter));
                features = containElements[0].features;
            }

            var drawPolygons = polygonFilter.geometry.coordinates;
            let lenDrawPolys = drawPolygons.length;

            for (let j = 0; j < lenDrawPolys; j++) {

                const coords = lenDrawPolys == 1 ? [drawPolygons[j]] : drawPolygons[j];
                const poly = turf.polygon(coords);

                for (let index = 0, len = features.length; index < len; index++) {

                    const polygon = features[index];
                    const pos = classIndex[parseInt(features[index]['properties']['classId'])];

                    var intersectArea = turf.intersect(polygon, poly);

                    //Convert area to hectares (ha = m^2 / 10000)
                    calcArea = intersectArea ? turf.area(intersectArea) / 10000 : 0;

                    if (calcArea > areaToFilter) {       
                        dataArea[pos] = dataArea[pos] != null ? 
                            dataArea[pos] + calcArea : calcArea;
                    }
                }

            }

        }

        var yCategories = Object.keys(classNames);
        var xCategories = yCategories.slice().reverse();
        var colors = dataLyr.getClassColors();

        var dataErrorMatrix = this.computeDataToErrorMatrixFiltered(yCategories, xCategories, dataArea, colors);

        return [xCategories, yCategories, dataErrorMatrix];
    }

    computeDataToErrorMatrixFiltered(yCategories, xCategories, dataArea, colors){
        
        var dataErrorMatrix = [];
        var dataToComputeMetrics = [];

        var lenJ = yCategories.length;
        var lenI = xCategories.length;

        if ( this.lastX == -1 && this.lastY == -1) {
            this.lastX = 0;
            this.lastY = lenJ - 1;
        }
        
        //Construct classes data for error matrix  with horizontal total
        var count = 3;
        var totalArea = [0, 0];
        for (let horizontal = 0; horizontal < lenI; horizontal++) {
            for (let vertical = 0; vertical < lenJ ; vertical++) {
                const value = dataArea[count] ? dataArea[count] : 0;
                dataErrorMatrix.push(
                    {
                        x: horizontal,
                        y: lenJ - (vertical + 1),
                        color: colors[count + 1], 
                        value: value,
                    }
                );
                dataToComputeMetrics.push(value);
                count -= 1;
                totalArea[horizontal] += value;
            }
        }

        dataErrorMatrix[0].value = parseFloat((dataErrorMatrix[0].value / totalArea[0] * 100).toFixed(2));
        dataErrorMatrix[1].value = parseFloat((dataErrorMatrix[1].value / totalArea[0] * 100).toFixed(2));
        dataErrorMatrix[2].value = parseFloat((dataErrorMatrix[2].value / totalArea[1] * 100).toFixed(2));
        dataErrorMatrix[3].value = parseFloat((dataErrorMatrix[3].value / totalArea[1] * 100).toFixed(2));

        return dataErrorMatrix;
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