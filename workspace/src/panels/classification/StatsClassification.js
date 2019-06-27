import { Stats } from '../Stats';

var INFO_TABLE = 'table';
var INFO_PIECHART = 'piechart';
var INFO_COMBOCHART = 'combochart';

export class StatsClassification extends Stats{

    constructor(){
        super();
    }

    createStatsPanel(lyrObj){

        this.selectedLayers.push(lyrObj);
        this.classificationLayers[lyrObj.getId()] = lyrObj;

        var obj = lyrObj;

        //var globalStatsAreaInPixel = globalStats[this.dec.statsAreaInPixel];
        //var globalStatsAreaInHectare = globalStats[this.dec.statsAreaInHectare];
        //var globalStatsPerimeterInMeters = globalStats[this.dec.statsPerimeterInMeters];

        //var globalStatsKey = Object.keys(globalStats);

        var content = document.getElementById('content-stats');

        content.append(this.createStatsForIndividualLayer(obj));
        
        for (let index = 1; index < 8; index++) {
            this.setEventListeners(obj.getId() + index, obj);
        }

        return content;
    }

    createStatsForIndividualLayer(obj){
        
        var sourceC = document.getElementById('content-stats-'+obj.getId());

        if (sourceC === null) {
            sourceC = document.createElement('div');
            sourceC.id = 'content-stats-'+obj.getId();
        }

        sourceC.append(this.createStatsPanelOfAttribute('Number of polygons', obj.getId() + 1));
        sourceC.append(this.createStatsPanelOfAttribute('Total occupied area (Pixels)', obj.getId() + 2));
        sourceC.append(this.createStatsPanelOfAttribute('Minimum occupied area (Pixels)', obj.getId() + 3));
        sourceC.append(this.createStatsPanelOfAttribute('Maximum occupied area (Pixels)', obj.getId() + 4));
        sourceC.append(this.createStatsPanelOfAttribute('Mean of mean occupied area per class (Pixels)', obj.getId() + 5));
        sourceC.append(this.createStatsPanelOfAttribute('Mean of standard deviation occupied area per class (Pixels)', obj.getId() + 6));
        sourceC.append(this.createStatsPanelOfAttribute('Mean of median occupied area per class (Pixels)', obj.getId() + 7));

        return sourceC;
    }

    createStatsPanelOfAttribute(panelTitle, idPanel){
        
        var attributePanel = document.createElement('div');
        attributePanel.id = 'panel-attribute-'+ idPanel;

        attributePanel.innerHTML = 
            '<div class="card border-dark mb-3">'+
                '<div class="card-header text-center mask flex-center rgba-red-strong"' +
                    ' data-toggle="collapse" href="#collapse-' + idPanel + '" ' +
                        'role="button" aria-expanded="true" aria-controls="collapse">'+
                            panelTitle +
                '</div>' +
                '<div class="card-body collapse" id="collapse-' + idPanel + '" style="padding: 0px">'
                   + this.createContentOfStatsPanelOfAttribute(idPanel) +
                '</div>' +
            '</div>';

        return attributePanel;
    }

    createContentOfStatsPanelOfAttribute(idPanel){

        var contentAttributePanel = document.createElement('div');
        contentAttributePanel.className = 'attribute-content-panel';

        contentAttributePanel.innerHTML =
            '<button title="View table" id="info-table-button-' + idPanel + '" class="btn info-table-button"></button>' +
            '<button title="View Piechart" id="piechart-button-' + idPanel + '" class="btn piechart-button"></button>' +
            '<button title="View Combochart" id="combochart-button-' + idPanel + '" class="btn combochart-button"></button>';

        return contentAttributePanel.outerHTML;
    }


    /**
     * DETAIL BOARD TO ANALYSE A SPECIFIC ATTRIBUTE
     */
    setEventListeners(idPanel, obj){
        
        var funcAux = this.createStatsDetailBoard;

        var tableBtn = document.getElementById('info-table-button-' + idPanel);
        tableBtn.addEventListener('click', function(e) {
            funcAux(INFO_TABLE, obj);
        });

        var pieBtn = document.getElementById('piechart-button-' + idPanel);
        pieBtn.addEventListener('click', function(e) {
            funcAux(INFO_PIECHART, obj);
        });

        var comboBtn = document.getElementById('combochart-button-' + idPanel);
        comboBtn.addEventListener('click', function(e) {
            funcAux(INFO_COMBOCHART, obj);
        });

        var closeFunc = this.closeStatsDetailBoard;
        var closeBtn = document.getElementById('close-button');
        closeBtn.addEventListener('click', function(e) {
            closeFunc();
        });

    }
}