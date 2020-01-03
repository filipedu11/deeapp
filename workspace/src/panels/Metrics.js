import Highcharts from 'highcharts';
import Highmaps from 'highcharts/modules/map';
import exporting from 'highcharts/modules/exporting';

Highmaps(Highcharts);
exporting(Highcharts);

import * as turf from '@turf/turf';

/*eslint no-undef: "error"*/
/*eslint-env node*/
var geojsonRbush = require('geojson-rbush').default;

export class Metrics {

    constructor(){

    }

    createMetricsGraph(dataMetricsGraph) {

        Highcharts.chart('controls-content-metrics-plot', {
            chart: {
                type: 'scatter',
                zoomType: 'x',
                zoomKey: 'ctrl',
                height: 300,
                width: 500
            },
            title: {
                text: 'Valor das métrcias para diferentes máximos do filtro de area'
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'Área máxima (ha)'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true,
                type: 'logarithmic'
            },
            yAxis: {
                title: {
                    text: 'Valor métricas (%)'
                }
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        pointFormat: '<b>{series.name}</b>: {point.y} % <br><b>Área máxima</b>: {point.x} area ha'
                    }
                }
            },
            series: dataMetricsGraph
        });
    }

    createMetricsGraphForBuffer(dataMetricsGraph) {

        Highcharts.chart('controls-content-metrics-plot-for-buffer', {
            chart: {
                type: 'scatter',
                zoomType: 'x',
                zoomKey: 'ctrl',
                height: 300,
                width: 500
            },
            title: {
                text: 'Valor das métrcias para diferentes tamanhos de buffer na fronteira'
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'Tamanho do buffer (km)'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {
                    text: 'Valor métricas (%)'
                }
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        pointFormat: '<b>{series.name}</b>: {point.y} % <br><b>Tamanho do buffer</b>: {point.x} km'
                    }
                }
            },
            series: dataMetricsGraph
        });
    }

    computeOA(dataToComputeMetrics){

        var numerator = 0;
        var divisor = 0;
        var lenData = dataToComputeMetrics.length;
        var step = Math.sqrt(lenData);
        var oa = 0;

        let diag = 0;

        for (let index = 0; index < lenData; index++) {
            const element = dataToComputeMetrics[index];

            if (index % step == 0) {
                numerator += dataToComputeMetrics[index + diag];
                diag+=1;
            }

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

    computePrecision(dataToComputeMetrics, col=1){

        var lenData = dataToComputeMetrics.length;
        var len = Math.sqrt(lenData);
        var startCol = col * len;
        var endCol = (col + 1) * len;
        var precision = 0;

        var numerator = dataToComputeMetrics[startCol + col];
        var divisor = 0;

        for (let index = startCol; index < endCol; index++) {
            divisor += dataToComputeMetrics[index];
        }

        precision = ((numerator / divisor) * 100).toFixed(1);

        return precision;
    }

    computeRecall(dataToComputeMetrics, line=1){

        var lenData = dataToComputeMetrics.length;
        var step = Math.sqrt(lenData);
        var recall = 0;
        var startLine = line;

        
        var numerator = dataToComputeMetrics[startLine * step + startLine];
        var divisor = 0;

        for (let index = startLine; index < lenData; index+=step) {
            divisor += dataToComputeMetrics[index];
        }

        recall = ((numerator / divisor) * 100).toFixed(1);

        return recall;
    }

}