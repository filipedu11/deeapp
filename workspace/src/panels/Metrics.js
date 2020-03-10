import Highcharts from 'highcharts';
import Highmaps from 'highcharts/modules/map';
import exporting from 'highcharts/modules/exporting';

Highmaps(Highcharts);
exporting(Highcharts);

import * as turf from '@turf/turf';

/*eslint no-undef: "error"*/
/*eslint-env node*/
const geojsonRbush = require('geojson-rbush').default;

export class Metrics {

    constructor(){
        this.info = document.getElementById('info-error-matrix');
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
                text: ''
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
                text: ''
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

    clearMetricsInfo() {
        this.info.innerHTML = '';
    }

    addMetricsInfo(dataToComputeMetrics, xCategories) {
        const oa = this.computeOA(dataToComputeMetrics);
        const mcc = this.computeMCC(dataToComputeMetrics);

        const oaClassCircle = this.getCircleClassName(oa);
        const mccClassCircle = this.getCircleClassName(mcc);

        const precision = this.computePrecision(dataToComputeMetrics);
        const precisionClassCircle = this.getCircleClassName(precision);
        const recall = this.computeRecall(dataToComputeMetrics);
        const recallClassCircle = this.getCircleClassName(recall);
        const f1 = this.computeF1(parseFloat(precision), parseFloat(recall));
        const f1ClassCircle = this.getCircleClassName(f1);

        const precisionFP = this.computePrecision(dataToComputeMetrics, 0);
        const precisionClassCircleFP = this.getCircleClassName(precisionFP);
        const recallFP = this.computeRecall(dataToComputeMetrics, 0);
        const recallClassCircleFP = this.getCircleClassName(recallFP);
        const f1FP = this.computeF1(parseFloat(precisionFP), parseFloat(recallFP));
        const f1ClassCircleFP = this.getCircleClassName(f1FP);

        this.info.innerHTML = '<br/><hr/>';  

        this.info.innerHTML +=
        '<div class="row justify-content-md-center">' +
            '<div class="col col-md-12 text-center" style="padding:0;">' +
                '<h5>Métricas Globais</h5>' +
            '</div>' +
        '</div>' +
        '<div class="row justify-content-md-center">' +
            '<div class="col col-md-6 text-center" style="padding:0;">' +
                '<h6>Overall Accuracy</h6>' +
            '</div>' +
            '<div class="col col-md-6 text-center" style="padding:0;">' +
                '<h6>Matthews correlation coefficient</h6>' +
            '</div>' +
        '</div>' +
        '<div class="row justify-content-md-center">' +
            '<div class="col col-md-6" style="padding:0;">' +
                '<div class="' + oaClassCircle + '">' +
                    '<span>' + oa + '%</span>' +
                    '<div class="slice">' +
                        '<div class="bar"></div>' +
                        '<div class="fill"></div>' +
                    '</div>' +
                '</div>'+
            '</div>' +
            '<div class="col col-md-6" style="padding:0;">' +
            '<div class="' + mccClassCircle + '">' +
                '<span>' + mcc + '%</span>' +
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
                '<h5>Métricas por classe: '+xCategories[0]+'</h5>' +
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
        '</div>' +
        '<br/><br/>' +
        '<div class="row justify-content-md-center">' +
            '<div class="col col-md-12 text-center" style="padding:0;">' +
                '<h5>Métricas por classe: '+xCategories[1]+'</h5>' +
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
                '<div class="' + precisionClassCircleFP + '">' +
                    '<span>' + precisionFP + '%</span>' +
                    '<div class="slice">' +
                        '<div class="bar"></div>' +
                        '<div class="fill"></div>' +
                    '</div>' +
                '</div>'+
            '</div>' +
            '<div class="col col-md-4" style="padding:0;">' +
                '<div class="' + recallClassCircleFP + '">' +
                '<span>' + recallFP + '%</span>' +
                    '<div class="slice">' +
                        '<div class="bar"></div>' +
                        '<div class="fill"></div>' +
                    '</div>' +
                '</div>'+
            '</div>'+
            '<div class="col col-md-4" style="padding:0;">' +
                '<div class="' + f1ClassCircleFP + '">' +
                    '<span>' + f1FP + '%</span>' +
                    '<div class="slice">' +
                        '<div class="bar"></div>' +
                        '<div class="fill"></div>' +
                    '</div>' +
                '</div>'+
            '</div>'+
        '</div>';
    }

    getCircleClassName(value){
        return 'c100 center p' + Math.round(value) + ' small ' + (value > 90 ? 'green' : value > 80 ? 'green dark' : value > 70 ? 'orange dark' : 'orange') ;
    }

    getCircleClassMCC(value){
        return 'c100 center p' + Math.round(value*100) + ' small ' + (value > 0.75 ? 'green' : value > 0.25 ? 'green dark' : value > 0 ? 'orange dark' : 'orange') ;
    }

    computeOA(dataToComputeMetrics){

        let numerator = 0;
        let divisor = 0;
        let lenData = dataToComputeMetrics.length;
        let step = Math.sqrt(lenData);
        let oa = 0;
    
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
    
    computeF1(precision, recall){
    
        const f1 = 2 * ((precision*recall)/(precision+recall));
        return f1.toFixed(1);
    }
    
    computeRecall(dataToComputeMetrics, col=1){
    
        let lenData = dataToComputeMetrics.length;
        let len = Math.sqrt(lenData);
        let startCol = col * len;
        let endCol = (col + 1) * len;
        let precision = 0;
    
        let numerator = dataToComputeMetrics[startCol + col];
        let divisor = 0;
    
        for (let index = startCol; index < endCol; index++) {
            divisor += dataToComputeMetrics[index];
        }
    
        precision = (numerator / divisor) * 100;
    
        return precision.toFixed(1);
    }
    
    computePrecision(dataToComputeMetrics, line=1){
    
        let lenData = dataToComputeMetrics.length;
        let step = Math.sqrt(lenData);
        let recall = 0;
        let startLine = line;
    
        
        let numerator = dataToComputeMetrics[startLine * step + startLine];
        let divisor = 0;
    
        for (let index = startLine; index < lenData; index+=step) {
            divisor += dataToComputeMetrics[index];
        }
    
        recall = (numerator / divisor) * 100;
    
        return recall.toFixed(1);
    }
    

    computeMCC(dataToComputeMetrics){

        const tn = dataToComputeMetrics[0];
        const fn = dataToComputeMetrics[1];
        const fp = dataToComputeMetrics[2];
        const tp = dataToComputeMetrics[3];
        
        const mcc = (tp*tn - fp*fn) / Math.sqrt((tp+fp)*(tp+fn)*(tn+fp)*(tn+fn));

        return (mcc*100).toFixed(1);
    }

}