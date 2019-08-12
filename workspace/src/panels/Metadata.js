
export class Metada {

    constructor(lyrObj){
        this.lyrObj = lyrObj;
    }

    clearMetadataPanel(){
        var content = document.getElementById('content-metadata-'+this.lyrObj.getId());

        if (content !== null) {
            //CLEAR PREVIOUS CONTENT
            content.innerHTML = '';
        }
    }
}