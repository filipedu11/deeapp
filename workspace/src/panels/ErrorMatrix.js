import 'highcharts';
import Highcharts from 'highcharts';
import Highmaps from 'highcharts/highmaps';

import exporting from 'highcharts/modules/exporting';

exporting(Highcharts);
exporting(Highmaps);

import * as turf from '@turf/turf';

/*eslint no-undef: "error"*/
/*eslint-env node*/
var geojsonRbush = require('geojson-rbush').default;
export class ErrorMatrix {

    constructor(){
        this.content = document.getElementById('content-error-matrix');
        this.info = document.getElementById('info-error-matrix');
        this.infoErrorMatrixGlobal = document.createElement('div');
        this.infoErrorMatrixGlobal.id = 'info-error-matrix-global';
        this.infoErrorMatrixFiltered = document.createElement('div');
        this.infoErrorMatrixFiltered.id = 'info-error-matrix-filtered';
    }

    clearStatsPanel(){
        this.content.innerHTML = '';
        this.info.innerHTML = '';

        this.lastX = -1;
        this.lastY = -1;
    }

    // createStatsController(){

    //     var tabToSelectStatsInfo = document.createElement('div');
    //     tabToSelectStatsInfo.id = 'selection-button';

    //     tabToSelectStatsInfo.className = 'attribute-content-panel';

    //     tabToSelectStatsInfo.innerHTML =
    //         '<button title="View table" id="info-table-button" class="btn info-table-button"></button>' +
    //         '<button title="View Piechart" id="piechart-button" class="btn piechart-button"></button>';

    //     this.controller.appendChild(tabToSelectStatsInfo);

    //     this.setEventListeners();
    // }

    // setEventListeners(){
    // }

    createConfusionMatrix(lyr, dataLyr){
        
        var confusionMatrix = document.getElementById('confusion-matrix-global');
        
        if ( !confusionMatrix ) {
            confusionMatrix = document.createElement('div');
            confusionMatrix.id = 'confusion-matrix-global';
            confusionMatrix.style.width = '100%';
            confusionMatrix.style.marginBottom = '5px';
            confusionMatrix.style.marginTop = '5px';

            this.content.appendChild(confusionMatrix);
        }

        var xCategories, yCategories, data;
        
        var dataForErrorMatrix = this.getDataForErrorMatrix(dataLyr);
        var title = dataLyr.getName().split(' | ');
        var xAxisTitle = title[0];
        var yAxisTitle = title[1];

        xCategories = dataForErrorMatrix[0];
        yCategories = dataForErrorMatrix[1];
        data = dataForErrorMatrix[2];
        var resultLabel = dataLyr.getBinaryClassNamesForErrorMatrix();

        confusionMatrix.style.height = xCategories.length * 125 + 'px';

        this.confusionMatrixHigh = Highmaps.chart('confusion-matrix-global', {
            chart: {
                type: 'heatmap',
                plotBorderWidth: 0,
                borderColor: 'rgba(255,255,255,0)',
                backgroundColor:'rgba(255, 255, 255, 0.0)'
            },
            title: {
                text: 'Global'
            },
            subtitle: {
                text: '(em ha)'
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
                    this.series.yAxis.categories[this.point.y] + '<br><b>Área em ha:</b> ' + this.point.value;
                }
            },
            series: [{
                name: 'Confusion matrix',
                borderWidth: 0,
                data: data,
                dataLabels: {
                    enabled: true
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

        this.dataForErrorMatrixGlobal = dataErrorMatrix;

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
        for (let i = 0; i < lenI; i++) {
            for (let j = 0; j < lenJ ; j++) {
                const value = dataArea[count] ? parseFloat(dataArea[count].toFixed(3)) : 0;
                dataErrorMatrix.push(
                    {
                        x: i,
                        y: lenJ - (j + 1),
                        color: colors[count + 1], 
                        value: dataArea[count] ? parseFloat(dataArea[count].toFixed(3)) : 0,
                    }
                );
                dataToComputeMetrics.push(value);
                count -= 1;
            }
        }

        this.addMetricsInfo(dataToComputeMetrics, this.lastX, this.lastY, xCategories, this.infoErrorMatrixGlobal);

        return dataErrorMatrix;
    }

    createConfusionMatrixFiltered(dataLyr, areaToFilter, polygonFilter){

        var textPolyFilter = polygonFilter ? ' & Poligonos' : '';

        var confusionMatrix = document.getElementById('confusion-matrix-filtered');
        
        var infoErrorMatrixGlobal = this.infoErrorMatrixGlobal;
        var infoErrorMatrixFiltered = this.infoErrorMatrixFiltered;

        if ( !confusionMatrix ) {
            confusionMatrix = document.createElement('div');
            confusionMatrix.id = 'confusion-matrix-filtered';
            confusionMatrix.style.width = '100%';
            confusionMatrix.style.marginBottom = '5px';
            confusionMatrix.style.marginTop = '5px';

            this.content.appendChild(confusionMatrix);
        }

        confusionMatrix.onchange = function(){
            document.getElementById('loader').className = 'inline-block';
        };

        var xCategories, yCategories, data;
        
        var dataForErrorMatrixFiltered = this.getDataForErrorMatrixFiltered(dataLyr, areaToFilter, polygonFilter);
        var dataForErrorMatrixGlobal = this.dataForErrorMatrixGlobal;
        var title = dataLyr.getName().split(' | ');
        var xAxisTitle = title[0];
        var yAxisTitle = title[1];

        xCategories = dataForErrorMatrixFiltered[0];
        yCategories = dataForErrorMatrixFiltered[1];
        data = dataForErrorMatrixFiltered[2];
        var resultLabel = dataLyr.getBinaryClassNamesForErrorMatrix();

        confusionMatrix.style.height = xCategories.length * 125 + 'px';

        var erroMatrixClass = this;
        var dataForInfoMetricsFiltered = [];
        var dataForInfoMetricsGlobal = [];

        data.forEach(element => {
            dataForInfoMetricsFiltered.push(element['value']);
        });

        dataForErrorMatrixGlobal.forEach(element => {
            dataForInfoMetricsGlobal.push(element['value']);
        });

        this.confusionMatrixFiltered = Highmaps.chart('confusion-matrix-filtered', {
            chart: {
                type: 'heatmap',
                plotBorderWidth: 1,
                borderColor: 'rgba(255,255,255,0)',
                backgroundColor:'rgba(255, 255, 255, 0.0)'
            },
            title: {
                text: 'Filtrada'
            },
            subtitle: {
                text: 'Área > ' + areaToFilter + ' (em ha) ' + textPolyFilter
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
                    enabled: true
                }
            }],
            exporting : {
                buttons: {
                    contextButton: {
                        symbolFill: 'rgba(255,255,255,0)'
                    }
                }
            },
            plotOptions: {
                series: {
                    point: {
                        events: {
                            click: function (event) {
                                if (this.x + this.y == this.series.xAxis.max){
                                    erroMatrixClass.addMetricsInfo(dataForInfoMetricsGlobal, this.x, this.y, xCategories, infoErrorMatrixGlobal);
                                    erroMatrixClass.addMetricsInfo(dataForInfoMetricsFiltered, this.x, this.y, xCategories, infoErrorMatrixFiltered);
                                    erroMatrixClass.lastX = this.x;
                                    erroMatrixClass.lastY = this.y;
                                }
                            },
                            mouseOver: function (event) {
                                if (this.x + this.y == this.series.xAxis.max) {
                                    this.series.chart.renderer.setStyle(
                                        {
                                            cursor: 'pointer'
                                        }
                                    );
                                }
                                else {
                                    this.series.chart.renderer.setStyle(
                                        {
                                            cursor: 'text'
                                        }
                                    );
                                }
                            },
                            mouseOut: function (event) {
                                this.series.chart.renderer.setStyle(
                                    {
                                        cursor: 'text'
                                    }
                                );
                            },
                        }
                    }
                },
            },
        });
    }

    getDataForErrorMatrixFiltered(dataLyr, areaToFilter, polygonFilter){

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
                const polygon = features[index];
                const pos = classIndex[parseInt(features[index]['properties']['classId'])];

                //Convert area to hectares (ha = m^2 / 10000)
                calcArea = turf.area(polygon) / 10000;
                if (calcArea > areaToFilter) {
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
        for (let i = 0; i < lenI; i++) {
            for (let j = 0; j < lenJ ; j++) {
                const value = dataArea[count] ? parseFloat(dataArea[count].toFixed(3)) : 0;
                dataErrorMatrix.push(
                    {
                        x: i,
                        y: lenJ - (j + 1),
                        color: colors[count + 1], 
                        value: dataArea[count] ? parseFloat(dataArea[count].toFixed(3)) : 0,
                    }
                );
                dataToComputeMetrics.push(value);
                count -= 1;
            }
        }

        this.addMetricsInfo(dataToComputeMetrics, this.lastX, this.lastY, xCategories, this.infoErrorMatrixFiltered);

        return dataErrorMatrix;
    }

    addMetricsInfo(dataToComputeMetrics, col = 0, line = 0, xCategories, infoMatrix) {
        var oa = this.computeOA(dataToComputeMetrics);
        var oaClassCircle = this.getCircleClassName(oa);
        var f1 = this.computeF1(dataToComputeMetrics, col);
        var f1ClassCircle = this.getCircleClassName(f1);

        var precision = this.computePrecision(dataToComputeMetrics, col);
        var precisionClassCircle = this.getCircleClassName(precision);
        var recall = this.computeRecall(dataToComputeMetrics, line);
        var recallClassCircle = this.getCircleClassName(recall);

        infoMatrix.innerHTML = '<br/><hr/>';

        var matrixTitle = infoMatrix.id == 'info-error-matrix-global' ? '' : ' (filtrada)';
        

        infoMatrix.innerHTML +=
        '<div class="row justify-content-md-center">' +
            '<div class="col col-md-12 text-center" style="padding:0;">' +
                '<h5 style="display: inline">Métricas Globais</h5><h6 style="display: inline">' + matrixTitle + '</h6>' +
            '</div>' +
        '</div>' +
        '<div class="row justify-content-md-center">' +
            '<div class="col col-md-12 text-center" style="padding:0;">' +
                '<h6>Overall Accuracy</h6>' +
            '</div>' +
        '</div>' +
        '<div class="row justify-content-md-center">' +
            '<div class="col col-md-12" style="padding:0;">' +
                '<div class="' + oaClassCircle + '">' +
                    '<span>' + oa + '%</span>' +
                    '<div class="slice">' +
                        '<div class="bar"></div>' +
                        '<div class="fill"></div>' +
                    '</div>' +
                '</div>'+
            '</div>' +
        '</div>' +
        '<br/><br/>' +
        '<div class="row justify-content-md-center">' +
            '<div class="col col-md-12 text-center" style="padding:0;">' +
                '<h5 style="display: inline">Métricas por classe</h5><h6 style="display: inline">' + matrixTitle + '</h6>' +
                '<p>(classe selecionada: ' + xCategories[col] + ')</p>' +
            '</div>' +
        '</div>' +
        '<div class="row justify-content-md-center">' +
            '<div class="col col-md-4 text-center" style="padding:0;">' +
                '<h6>Precision</h6>' +
            '</div>' +
            '<div class="col col-md-4 text-center" style="padding:0;">' +
                '<h6>Recall</h6>' +
            '</div>' +
            '<div class="col col-md-4 text-center" style="padding:0;">' +
                '<h6>F1 score</h6>' +
            '</div>' +
        '</div>' +
        '<div class="row justify-content-md-center">' +
            '<div class="col col-md-4" style="padding:0;">' +
                '<div class="' + precisionClassCircle + '">' +
                    '<span>' + precision + '%</span>' +
                    '<div class="slice">' +
                        '<div class="bar"></div>' +
                        '<div class="fill"></div>' +
                    '</div>' +
                '</div>'+
            '</div>' +
            '<div class="col col-md-4" style="padding:0;">' +
                '<div class="' + recallClassCircle + '">' +
                '<span>' + recall + '%</span>' +
                    '<div class="slice">' +
                        '<div class="bar"></div>' +
                        '<div class="fill"></div>' +
                    '</div>' +
                '</div>'+
            '</div>'+
            '<div class="col col-md-4" style="padding:0;">' +
                '<div class="' + f1ClassCircle + '">' +
                    '<span>' + f1 + '%</span>' +
                    '<div class="slice">' +
                        '<div class="bar"></div>' +
                        '<div class="fill"></div>' +
                    '</div>' +
                '</div>'+
            '</div>'+
        '</div>';

        this.info.appendChild(infoMatrix);
    }

    getCircleClassName(value){
        return 'c100 center p' + Math.round(value) + ' small ' + (value > 90 ? 'green' : value > 80 ? 'yellow' : value > 70 ? 'orange' : 'red') ;
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