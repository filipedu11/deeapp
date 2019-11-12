import Highcharts from 'highcharts';
import Highmaps from 'highcharts/modules/map';

Highmaps(Highcharts);

import * as turf from '@turf/turf';

/*eslint no-undef: "error"*/
/*eslint-env node*/
var geojsonRbush = require('geojson-rbush').default;

export class ErrorMatrix {

    constructor(){
        this.content = document.getElementById('content-error-matrix-oa');
        this.info = document.getElementById('info-error-matrix-oa');
        this.infoErrorMatrixGlobal = document.createElement('div');
        this.infoErrorMatrixGlobal.id = 'info-error-matrix-global-oa';
        this.infoErrorMatrixFiltered = document.createElement('div');
        this.infoErrorMatrixFiltered.id = 'info-error-matrix-filtered-oa';
    }

    clearStatsPanel(){
        this.content.innerHTML = '';
        this.info.innerHTML = '';

        this.lastX = -1;
        this.lastY = -1;
    }

    createConfusionMatrix(dataLyr, isFilter = false, filterAreaInterval = null, polygonFilter = null){

        var idMatrix = 
            isFilter ? 
                'confusion-matrix--oa' : 
                'confusion-matrix-global-oa';

        var confusionMatrix = document.getElementById(idMatrix);

        if ( !confusionMatrix ) {
            confusionMatrix = document.createElement('div');
            confusionMatrix.id = idMatrix;
            confusionMatrix.style.width = '100%';
            confusionMatrix.style.marginBottom = '5px';
            confusionMatrix.style.marginTop = '5px';

            this.content.appendChild(confusionMatrix);
        }

        confusionMatrix.onchange = function(){
            document.getElementById('loader').className = 'inline-block';
        };

        var xCategories, yCategories, data;
        
        var dataForErrorMatrix = this.getDataForErrorMatrix(dataLyr, filterAreaInterval, polygonFilter);
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

    getDataForErrorMatrix(dataLyr, filterAreaInterval, polygonFilter){

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

        if(polygonFilter) {

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

                    if (filterAreaInterval[0] <= calcArea && calcArea <= filterAreaInterval[1]) {
                        dataArea[pos] = dataArea[pos] != null ? 
                            dataArea[pos] + calcArea : calcArea;
                    }
                }
            }
        } else {

            for (let index = 0, len = features.length; index < len; index++) {
                const polygon = features[index];
                const pos = classIndex[parseInt(features[index]['properties']['classId'])];

                //Convert area to hectares (ha = m^2 / 10000)
                calcArea = turf.area(polygon) / 10000;
                if (!filterAreaInterval || filterAreaInterval[0] <= calcArea && calcArea <= filterAreaInterval[1]) {
                    dataArea[pos] = dataArea[pos] != null ? 
                        dataArea[pos] + calcArea : calcArea;
                }
            }
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
                    }
                );
                dataToComputeMetrics.push(value);
                count -= 1;
                totalArea += value;
            }
        }

        dataErrorMatrix.forEach(element => {
            element.value = parseFloat((element.value / totalArea * 100).toFixed(2));
        });

        return dataErrorMatrix;
    }
}