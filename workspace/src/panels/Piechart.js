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
        this.content.className = 'row';
        this.info = document.getElementById('info-piechart');
    }

    clearStatsPanel(){
        this.content.innerHTML = '';
        this.info.innerHTML = '';
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

    //     var piechart = document.getElementById('piechart');
    // }

    /**
     * Create the piechart for the given selected layer
     */
    createPieChart(lyr, dataLyr, filterArea = -1){

        var dataPie = this.generateDataForPieChart(dataLyr, filterArea);
        var idPiechart = filterArea == -1 ? 'piechart' : 'piechart-filter';

        var dataPieDiv = document.getElementById(idPiechart);
        
        if ( !dataPieDiv ) {
            dataPieDiv = document.createElement('div');
            dataPieDiv.id = idPiechart;
            dataPieDiv.style.width = '100%';
            dataPieDiv.style.padding = '0px';
            dataPieDiv.className = 'col-md-6';
            

            this.content.appendChild(dataPieDiv);

            // Build the chart
            var pieHighChart = Highcharts.chart(idPiechart, {
                chart: {
                    backgroundColor:'rgba(255, 255, 255, 0)',
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: filterArea == -1 ? 'Global' : 'Filtrada'
                },
                subtitle: {
                    text: filterArea == -1 ? '(em ha)' : 'Área > ' + filterArea + ' (em ha)'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b><br/>{series.name}: <b>{point.y:.3f} ha</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: filterArea == -1 ? true : false,
                        cursor: filterArea == -1 ? 'pointer' : 'auto',
                        dataLabels: {
                            enabled: false,
                            format: '<b>{point.percentage:.2f}%</b><br/><b>{point.y:.3f} ha</b>'
                        },
                        showInLegend:  true,
                        point: {
                            events: {
                                legendItemClick: function(e) {
                                    if ( filterArea == -1 ) {
                                        var C_ID = e['target']['id'];
                                        lyr.get('inactiveClasses')[C_ID] = !lyr.get('inactiveClasses')[C_ID];
                                        lyr.getSource().dispatchEvent('change');
                                    }

                                    return true;
                                }
                            },
                        }
                    }
                },
                series: [{
                    name: 'Occupied Area',
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
            
            var isFullscreen = false;
            var height = pieHighChart.chartHeight;

            document.addEventListener('fullscreenchange', function() {
                isFullscreen = !isFullscreen;
                if (isFullscreen) {
                    pieHighChart.update({
                        chart: {
                            backgroundColor: 'rgba(255, 255, 255, 1)'
                        },
                        plotOptions: {
                            pie: {
                                dataLabels: {
                                    enabled: true,
                                }
                            }
                        }
                    });
                } else {
                    pieHighChart.update({
                        chart: {
                            backgroundColor: 'rgba(255, 255, 255, 0)',
                            height: height
                        },
                        plotOptions: {
                            pie: {
                                dataLabels: {
                                    enabled: false,
                                }
                            }
                        }
                    });
                }
            });

            if (filterArea == -1) {
                this.pieHighChart = pieHighChart;
            } else {
                this.pieHighChartFilter = pieHighChart;
            }
            
        } 
        else {
            this.pieHighChartFilter.series[0].setData(dataPie, true);
            this.pieHighChartFilter.setSubtitle({ 
                text: 'Área < ' + filterArea + ' (em ha)'
            });
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

    createInfoPanel() {

    }
}