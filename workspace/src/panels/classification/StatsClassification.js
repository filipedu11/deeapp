import { Stats } from '../Stats';

var INFO_TABLE = 'table';
var INFO_PIECHART = 'piechart';
var INFO_COMBOCHART = 'combochart';

export class StatsClassification extends Stats{

    constructor(lyrObj){
        super(lyrObj);
        this.dec = lyrObj.getDecode();
    }

    createStatsPanel(){

        var obj = this.lyrObj;
        var globalStats = obj.getGlobalStats();
        var classStats = obj.getClassStats();

        //var globalStatsAreaInPixel = globalStats[this.dec.statsAreaInPixel];
        //var globalStatsAreaInHectare = globalStats[this.dec.statsAreaInHectare];
        //var globalStatsPerimeterInMeters = globalStats[this.dec.statsPerimeterInMeters];

        //var globalStatsKey = Object.keys(globalStats);

        var content = document.getElementById('content-stats');

        var sourceC = document.getElementById('content-stats-'+obj.getId());

        if (sourceC === null) {
            sourceC = document.createElement('div');
            sourceC.id = 'content-stats-'+obj.getId();
        }

        sourceC.append(this.createStatsPanelOfAttribute(globalStats, classStats, 'Number of polygons', 1));
        sourceC.append(this.createStatsPanelOfAttribute(globalStats, classStats, 'Total occupied area (Pixels)', 2));
        sourceC.append(this.createStatsPanelOfAttribute(globalStats, classStats, 'Minimum occupied area (Pixels)', 3));
        sourceC.append(this.createStatsPanelOfAttribute(globalStats, classStats, 'Maximum occupied area (Pixels)', 4));
        sourceC.append(this.createStatsPanelOfAttribute(globalStats, classStats, 'Mean of mean occupied area per class (Pixels)', 5));
        sourceC.append(this.createStatsPanelOfAttribute(globalStats, classStats, 'Mean of standard deviation occupied area per class (Pixels)', 6));
        sourceC.append(this.createStatsPanelOfAttribute(globalStats, classStats, 'Mean of median occupied area per class (Pixels)', 7));
        sourceC.append(this.createStatsPanelOfAttribute(globalStats, classStats, 'Mean of median occupied area per class (Pixels)', 8));

        content.append(sourceC);

        this.setEventListeners();

        return content;
    }

    createStatsPanelOfAttribute(globalAttributeStat, classesAtributeStat, panelTitle, idPanel){
        
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

    setEventListeners(){
        
        var funcAux = this.createStatsMainBoard;

        var tableBtn = document.getElementById('info-table-button-1');
        tableBtn.addEventListener('click', function(e) {
            funcAux(INFO_TABLE);
        });

        var pieBtn = document.getElementById('piechart-button-1');
        pieBtn.addEventListener('click', function(e) {
            funcAux(INFO_PIECHART);
        });

        var comboBtn = document.getElementById('combochart-button-1');
        comboBtn.addEventListener('click', function(e) {
            funcAux(INFO_COMBOCHART);
        });

        var closeFunc = this.closeStatsMainBoard;
        var closeBtn = document.getElementById('close-button');
        closeBtn.addEventListener('click', function(e) {
            closeFunc();
        });

    }

    createStatsMainBoard(typeBoard){

        console.log(typeBoard);

        var mainBoard = document.getElementById('stats-main-board');
        mainBoard.className = 'inline-block';

        var statsBoard = document.getElementById('stats-board');

        var board = document.createElement('div');
        board.id = 'board';
        board.innerHTML = typeBoard;

        statsBoard.innerHTML = board.outerHTML;
    }

    closeStatsMainBoard(){

        var mainBoard = document.getElementById('stats-main-board');
        mainBoard.className = 'none-block';

    }

}