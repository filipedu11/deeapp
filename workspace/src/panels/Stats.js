import 'highcharts';
import Highcharts from 'highcharts';
import Highmaps from 'highcharts/highmaps';

import exporting from 'highcharts/modules/exporting';

exporting(Highcharts);
exporting(Highmaps);

import * as turf from '@turf/turf';

export class Stats {

    constructor(){
        this.content = document.getElementById('content-stats');
        this.controller = document.getElementById('controller-stats');
        this.controller = document.getElementById('filter-stats');
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

        var piechart = document.getElementById('piechart');
        var confusionMatrix = document.getElementById('confusion-matrix');

        var chart1 = this.pieHighChart;
        var chart2 = this.confusionMatrixHigh;

        
        var tableBtn = document.getElementById('info-table-button');
        tableBtn.addEventListener('click', function(e) {
            piechart.style.display = 'none';
            confusionMatrix.style.display = 'block';
            chart2.reflow();
        });

        var pieBtn = document.getElementById('piechart-button');
        pieBtn.addEventListener('click', function(e) {
            confusionMatrix.style.display = 'none';
            piechart.style.display = 'block';
            chart1.reflow();
        });
    }

    /**
     * Create the piechart for the given selected layer
     */
    createPieChart(lyr, dataLyr){

        var dataPie = this.generateDataForPieChart(dataLyr);

        var dataPieDiv = document.createElement('div');
        dataPieDiv.id = 'piechart';
        dataPieDiv.style.width = '100%';
        dataPieDiv.style.marginBottom = '5px';
        dataPieDiv.style.marginTop = '5px';

        this.content.appendChild(dataPieDiv);

        // Build the chart
        this.pieHighChart = Highcharts.chart('piechart', {
            chart: {
                backgroundColor:'rgba(255, 255, 255, 0.0)',
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: dataLyr.getName()
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b><br/>{series.name}: <b>{point.y:.3f} ha</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true,
                    point: {
                        events: {
                            legendItemClick: function(e) {
                                var C_ID = e['target']['id'];
                                lyr.get('inactiveClasses')[C_ID] = !lyr.get('inactiveClasses')[C_ID];
                                lyr.getSource().dispatchEvent('change');
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'Area',
                colorByPoint: true,
                data: dataPie
            }],
            exporting : {
                buttons: {
                    contextButton: {
                        theme:{
                            fill: 'rgba(255, 255, 255, 0.0)',
                            padding: 0
                        }
                    }
                }
            }
        });
    }

    /**
     * Generate the necessary data for the given layer
     * 
     * @dataLayer - Data Layer to analyse the data
     */
    generateDataForPieChart(dataLyr){
        
        var features = dataLyr.getFeatures();
        var classNames = dataLyr.getClassNames();
        var classColors = dataLyr.getClassColors();
        var classKeys = dataLyr.getKeysOfClasses();


        var dataPie = [];
        var classIndex = {};

        for (let index = 0, len = classKeys.length ; index < len; index++) {
            const key = classKeys[index];
            classIndex[key] = index;

            dataPie.push(
                {
                    name: classNames[key],
                    y: 0,
                    color: classColors[key],
                    id: key
                }
            );
        }

        for (let index = 0; index < features.length; index++) {
            const polygon = features[index]['geometry']['coordinates'];
            const pos = classIndex[parseInt(features[index]['properties']['classId'])];
            dataPie[pos]['y'] += turf.area(turf.polygon(polygon))/1000;
        }

        return dataPie;
    }


    createConfusionMatrix(lyr, dataLyr){
        
        var confusionMatrix = document.createElement('div');
        confusionMatrix.id = 'confusion-matrix';
        confusionMatrix.style.width = '100%';
        confusionMatrix.style.marginBottom = '5px';
        confusionMatrix.style.marginTop = '5px';
        confusionMatrix.style.display = 'none';

        this.content.appendChild(confusionMatrix);

        var xCategories, yCategories, data;
        
        var dataForErrorMatrix = this.getDataForErrorMatrix(dataLyr);

        xCategories = dataForErrorMatrix[0];
        yCategories = dataForErrorMatrix[1];
        data = dataForErrorMatrix[2];

        this.confusionMatrixHigh = Highmaps.chart('confusion-matrix', {
            chart: {
                type: 'heatmap',
                plotBorderWidth: 1,
                borderColor: 'rgba(255,255,255,0)',
                backgroundColor:'rgba(255, 255, 255, 0.0)'
            },
            title: {
                text: 'Matriz de Confusão'
            },
            xAxis: {
                categories: xCategories,
                opposite: true
            },
            yAxis: {
                categories: yCategories,
                title: null,
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
                    return '<b>' + this.series.xAxis.categories[this.point.x] + '</b> vs <b>' +
                    this.series.yAxis.categories[this.point.y] + '</b><br> Área in ha: ' + this.point.value + '</b>';
                }
            },
            series: [{
                name: 'Confusion matrix',
                borderWidth: 1,
                data: data,
                dataLabels: {
                    enabled: true,
                    color: 'rgba(0,0,0)'
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
            dataArea[pos] = dataArea[pos] != null ? 
                dataArea[pos] + turf.area(turf.polygon(polygon))/1000 : turf.area(turf.polygon(polygon))/1000;
        }

        var xCategories = Object.keys(classNames);
        xCategories.push('Total');
        var yCategories = xCategories.slice().reverse();

        var dataErrorMatrix = this.computeDateToErrorMatrix(yCategories, xCategories, dataArea);

        return [xCategories, yCategories, dataErrorMatrix];
    }

    computeDateToErrorMatrix(yCategories, xCategories, dataArea){

        
        var dataErrorMatrix = [];

        var lenJ = yCategories.length;
        var lenI = xCategories.length;
        var total = 0;
        var totalH = [];

        //Construct classes data for error matrix  with horizontal total
        for (let i = 0; i < lenI - 1; i++) {
            for (let j = 0; j < lenJ - 1; j++) {
                
                dataErrorMatrix.push(
                    [i, lenJ - (j + 1), parseFloat(dataArea[i+j].toFixed(3))]
                );

                total += dataArea[i+j];
                
                totalH[j] = totalH[j] != null ? totalH[j] + dataArea[i+j] : dataArea[i+j];
            }


            dataErrorMatrix.push(
                [i, 0, parseFloat(total.toFixed(3))]
            );

            total = 0;
        }

        // compute the total in vertical
        for (let j = 0; j < lenJ - 1; j++) {
            total += totalH[j];
            dataErrorMatrix.push(
                [lenI - 1, lenJ - (j + 1), parseFloat(totalH[j].toFixed(3))]
            );
        }

        // add total area classsified
        dataErrorMatrix.push(
            [lenI - 1, 0, parseFloat(total.toFixed(3))]
        );

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