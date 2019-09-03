import 'highcharts';
import Highcharts from 'highcharts';
import Highmaps from 'highcharts/highmaps';

import exporting from 'highcharts/modules/exporting';

exporting(Highcharts);
exporting(Highmaps);

import * as turf from '@turf/turf';

export class ErrorMatrix {

    constructor(){
        this.content = document.getElementById('content-error-matrix');
        this.controller = document.getElementById('controller-error-matrix');
    }

    clearStatsPanel(){
        this.content.innerHTML = '';
        this.controller.innerHTML = '';
    }

    createStatsController(){

        var tabToSelectStatsInfo = document.createElement('div');
        tabToSelectStatsInfo.id = 'selection-button';

        tabToSelectStatsInfo.className = 'attribute-content-panel';

        tabToSelectStatsInfo.innerHTML =
            '<button title="View table" id="info-table-button" class="btn info-table-button"></button>' +
            '<button title="View Piechart" id="piechart-button" class="btn piechart-button"></button>';

        this.controller.appendChild(tabToSelectStatsInfo);

        this.setEventListeners();
    }

    setEventListeners(){
    }

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
                borderWidth: 0.5,
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

        return [xCategories, yCategories, dataErrorMatrix];
    }

    computeDataToErrorMatrix(yCategories, xCategories, dataArea, colors){
        
        var dataErrorMatrix = [];

        var lenJ = yCategories.length;
        var lenI = xCategories.length;

        //Construct classes data for error matrix  with horizontal total
        var count = 3;
        for (let i = 0; i < lenI; i++) {
            for (let j = 0; j < lenJ ; j++) {
                dataErrorMatrix.push(
                    {
                        x: i,
                        y: lenJ - (j + 1),
                        color: colors[count + 1], 
                        value: parseFloat(dataArea[count].toFixed(3)),
                    }
                );
                count -= 1;
            }
        }

        return dataErrorMatrix;
    }

    createConfusionMatrixFiltered(dataLyr, areaToFilter){

        var confusionMatrix = document.getElementById('confusion-matrix-filtered');
        
        if ( !confusionMatrix ) {
            confusionMatrix = document.createElement('div');
            confusionMatrix.id = 'confusion-matrix-filtered';
            confusionMatrix.style.width = '100%';
            confusionMatrix.style.marginBottom = '5px';
            confusionMatrix.style.marginTop = '5px';

            this.content.appendChild(confusionMatrix);
        }

        var xCategories, yCategories, data;
        
        var dataForErrorMatrix = this.getDataForErrorMatrixFiltered(dataLyr, areaToFilter);
        var title = dataLyr.getName().split(' | ');
        var xAxisTitle = title[0];
        var yAxisTitle = title[1];

        xCategories = dataForErrorMatrix[0];
        yCategories = dataForErrorMatrix[1];
        data = dataForErrorMatrix[2];
        var resultLabel = dataLyr.getBinaryClassNamesForErrorMatrix();

        confusionMatrix.style.height = xCategories.length * 125 + 'px';

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
                text: 'Área < ' + areaToFilter + ' (em ha)'
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

    getDataForErrorMatrixFiltered(dataLyr, areaToFilter){
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

        for (let index = 0, len = features.length; index < len; index++) {
            const polygon = features[index]['geometry']['coordinates'];
            const pos = classIndex[parseInt(features[index]['properties']['classId'])];

            //Convert area to hectares (ha = m^2 / 10000)
            var calcArea = turf.area(turf.polygon(polygon)) / 10000;

            if (calcArea > areaToFilter) {       
                dataArea[pos] = dataArea[pos] != null ? 
                    dataArea[pos] + calcArea : calcArea;
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

        var lenJ = yCategories.length;
        var lenI = xCategories.length;

        //Construct classes data for error matrix  with horizontal total
        var count = 3;
        for (let i = 0; i < lenI; i++) {
            for (let j = 0; j < lenJ ; j++) {
                dataErrorMatrix.push(
                    {
                        x: i,
                        y: lenJ - (j + 1),
                        color: colors[count + 1], 
                        value: parseFloat(dataArea[count].toFixed(3)),
                    }
                );
                count -= 1;
            }
        }
        
        return dataErrorMatrix;
    }

    createThresholdToFilterAreas(dataLyr){
        var slideCont = document.createElement('div');
        slideCont.className= 'slidecontainer';
        var slideLabel = document.createElement('label');
        slideLabel.className= 'slidelabel';
        slideLabel.innerHTML = '<b>Opacity</b>';
        var inputTransp = document.createElement('input');
        inputTransp.className = 'slider';
        inputTransp.type = 'range';
        inputTransp.min = 0;
        inputTransp.max = 1;
        inputTransp.step = 0.05;
        inputTransp.value = lyr.getOpacity();
        inputTransp.oninput = function(){
            lyr.setOpacity(this.value);
        };

        slideLabel.appendChild(inputTransp);
        slideCont.appendChild(slideLabel);

        
    }
}