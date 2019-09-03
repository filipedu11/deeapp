import 'highcharts';
import Highcharts from 'highcharts';
import Highmaps from 'highcharts/highmaps';

import exporting from 'highcharts/modules/exporting';

exporting(Highcharts);
exporting(Highmaps);

import * as turf from '@turf/turf';

var EVALUATION_STRING = 'evaluation';

export class Piechart {

    constructor(){
        this.content = document.getElementById('content-piechart');
        this.controller = document.getElementById('controller-piechart');
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
    }

    /**
     * Create the piechart for the given selected layer
     */
    createPieChart(lyr, dataLyr, filterArea){

        var dataPie = this.generateDataForPieChart(dataLyr, filterArea);

        var dataPieDiv = document.getElementById('piechart');
        
        if ( !dataPieDiv ) {
            dataPieDiv = document.createElement('div');
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
        else {
            this.pieHighChart.series[0].setData(dataPie, true);
        }
    }

    /**
     * Generate the necessary data for the given layer
     * 
     * @dataLayer - Data Layer to analyse the data
     */
    generateDataForPieChart(dataLyr, filterArea){
        
        var features = dataLyr.getFeatures();
        var classNames = dataLyr.getClassNames();
        var classColors = dataLyr.getClassColors();
        var classKeys = dataLyr.getKeysOfClasses();

        if (dataLyr.getType() == EVALUATION_STRING && (classKeys.length == 4)) {
            classNames = dataLyr.getBinaryClassNamesForLegend();
        }

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

        var validArea = 0;

        for (let index = 0; index < features.length; index++) {
            const polygon = features[index]['geometry']['coordinates'];
            const pos = classIndex[parseInt(features[index]['properties']['classId'])];
            validArea = turf.area(turf.polygon(polygon))/10000;
            validArea = validArea >= filterArea ? validArea : 0;
            dataPie[pos]['y'] += validArea;
        }

        return dataPie;
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