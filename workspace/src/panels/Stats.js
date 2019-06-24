
export class Stats {

    constructor(lyrObj){
        this.lyrObj = lyrObj;
    }

    clearStatsPanel(){
        var content = document.getElementById('content-stats-'+this.lyrObj.getId());

        if (content !== null) {
            //CLEAR PREVIOUS CONTENT
            content.innerHTML = '';
        }
    }
}