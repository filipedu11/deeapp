
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
}