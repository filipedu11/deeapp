
export class Stats {

    constructor(){
        this.selectedLayers = [];
        this.classificationLayers = {};
        this.validationLayers = {};


        
    }

    clearStatsPanel(lyrObj){
        var content = document.getElementById('content-stats-'+lyrObj.getId());

        if (content !== null) {
            //CLEAR PREVIOUS CONTENT
            content.innerHTML = '';
        }
    }

    createStatsDetailBoard(typeBoard, objLyr){

        var mainBoard = document.getElementById('stats-main-board');
        mainBoard.className = 'inline-block';

        var statsBoard = document.getElementById('stats-board');

        var board = document.createElement('div');
        board.id = 'board-'+typeBoard;
        board.innerHTML = '<p>' + objLyr.getName() + '</p>';
        board.innerHTML += typeBoard;
        
        statsBoard.innerHTML = board.outerHTML;
    }

    closeStatsDetailBoard(){

        var mainBoard = document.getElementById('stats-main-board');
        mainBoard.className = 'none-block';

    }
}