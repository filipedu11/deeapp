import Highcharts from 'highcharts';
import Highmaps from 'highcharts/modules/map';

Highmaps(Highcharts);

import { Metrics } from './Metrics';

/*eslint no-undef: "error"*/
/*eslint-env node*/
var geojsonRbush = require('geojson-rbush').default;

export class ErrorMatrix {

    constructor(){
        this.content = document.getElementById('content-error-matrix');
        this.info = document.getElementById('info-error-matrix');

        this.metrics = new Metrics();
        this.errorMatrixExist = false;
    }

    clearStatsPanel(){
        this.content.innerHTML = '';
        this.info.innerHTML = '';

        this.lastX = -1;
        this.lastY = -1;
    }

    errorMatrixWithoutFilterExist() {
        return this.errorMatrixExist;
    }

    loadingFilterMatrix(){
        var confusionMatrix = document.getElementById('confusion-matrix-oa');
        if ( confusionMatrix ){
            confusionMatrix.innerHTML = '';
            confusionMatrix.style.width = '60px';
            confusionMatrix.style.height = '60px';
            confusionMatrix.className = 'loader';
        }
    }

    createConfusionMatrix(dataLyr, dataArea, isFilter = false){

        if (!this.errorMatrixExist) {
            this.errorMatrixExist = true;
        }

        var idMatrix = 
            isFilter ? 
                'confusion-matrix-oa' : 
                'confusion-matrix-global-oa';

        var confusionMatrix = document.getElementById(idMatrix);

        if ( !confusionMatrix ) {
            confusionMatrix = document.createElement('div');
            this.content.appendChild(confusionMatrix);
        }
        
        confusionMatrix.id = idMatrix;
        confusionMatrix.style.marginBottom = '5px';
        confusionMatrix.style.marginTop = '5px';
        confusionMatrix.style.width = '100%';
        confusionMatrix.className = '';

        confusionMatrix.onchange = function(){
            document.getElementById('loader').className = 'inline-block';
        };

        var xCategories, yCategories, data;
        
        var dataForErrorMatrix = this.getDataForErrorMatrix(dataLyr, dataArea);
        var title = dataLyr.getName().split(' | ');
        var xAxisTitle = '<b>' + title[0] + '</b>';
        var yAxisTitle = '<b>' + title[1] + '</b>';

        xCategories = dataForErrorMatrix[0];
        yCategories = dataForErrorMatrix[1];
        data = dataForErrorMatrix[2];

        var resultLabel = dataLyr.getBinaryClassNamesForErrorMatrix();

        confusionMatrix.style.height = xCategories.length * 125 + 'px';

        this.confusionMatrix = Highcharts.chart(idMatrix, {
            chart: {
                type: 'heatmap',
                plotBorderWidth: 1,
                borderColor: 'rgba(255,255,255,0)',
                backgroundColor:'rgba(255, 255, 255, 0.0)'
            },
            title: {
                text: isFilter ? '<b>Matrix de Erro (Com Filtros)</b>' : '<b>Matrix de Erro (Sem Filtros)</b>' 
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

                    return '<b>Resultado:</b> ' + resultLabel[binaryCode] + '<br/><b>Classe classificada:</b> ' + this.series.xAxis.categories[this.point.x] + '<br/><b>Classe de validação:</b> ' +
                    this.series.yAxis.categories[this.point.y] + '<br><b>Área ocupada (%) :</b> ' + this.point.percentage + '<br><b>Área ocupada (ha) :</b> ' + this.point.value;
                }
            },
            series: [{
                name: 'Confusion matrix',
                borderWidth: 0,
                data: data,
                dataLabels: {
                    enabled: true,
                    formatter: function () { 
                        return this.point.percentage + ' %';
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

    getDataForErrorMatrix(dataLyr, dataArea){

        var classNames = dataLyr.getIndividualClassNames();

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

        if ( this.lastX == -1 && this.lastY == -1) {
            this.lastX = 0;
            this.lastY = lenJ - 1;
        }
        
        //Construct classes data for error matrix  with total area
        var count = 3;
        var totalArea = 0;
        for (let i = 0; i < lenI; i++) {
            for (let j = 0; j < lenJ ; j++) {
                const value = dataArea[count] ? dataArea[count] : 0.0;

                dataErrorMatrix.push(
                    {
                        x: i,
                        y: lenJ - (j + 1),
                        color: colors[count + 1], 
                        value: value,
                        prct: 0
                    }
                );
                count -= 1;
                totalArea += value;
            }
        }

        dataErrorMatrix.forEach(element => {
            element.percentage = parseFloat((element.value / totalArea * 100).toFixed(2));
            element.value = parseFloat((element.value).toFixed(2));
        });

        return dataErrorMatrix;
    }
    
}