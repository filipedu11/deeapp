
export class Metada {

    constructor(lyrObj){
        this.lyrObj = lyrObj;
    }

    createReport(){
        
        var content = document.getElementById('content-metadata');

        content.append(this.lyrObj.getContentReport());
    }

    clearReport(){
        var content = document.getElementById('content-metadata-'+this.lyrObj.getId());

        if (content !== null) {
            //CLEAR PREVIOUS CONTENT
            content.innerHTML = '';
        }
    }
}