

export class Legend {

    constructor(){
        this.legend = document.getElementById('legend');
        this.legendContent = document.getElementById('legend-content');
    }

    createLegend(lyrObj){
        const classKeys = lyrObj.getKeysOfClasses();

        this.legendContent.innerHTML = '<h6><b><u>Legend</u></b></h6>';
                
        for (let index = 0; index <classKeys.length; index++) {

            this.legendContent.innerHTML += 
                '<li><span class="circle" style="background:' + lyrObj.getColorOfClass(classKeys[index]) + ';"></span> ' +  lyrObj.getNameOfClass(classKeys[index]) + ' </li>';
        }

        this.legend.className = 'inline-block';
    }

    clearLegend(){
        
        if (this.legend !== null) {
            //CLEAR PREVIOUS CONTENT
            this.legendContent.innerHTML = '';
            this.legend.className = 'none-block';
        }
    }
}