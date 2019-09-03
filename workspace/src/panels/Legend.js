var EVALUATION_STRING = 'evaluation';

export class Legend {

    constructor(){
        this.legend = document.getElementById('legend');
        this.legendContent = document.getElementById('legend-content');
    }

    createLegend(lyrObj){
        const classKeys = lyrObj.getKeysOfClasses();

        this.legendContent.innerHTML = '<h6><b><u>Legend</u></b></h6>';

        var classNames = lyrObj.getClassNames();

        if (lyrObj.getType() == EVALUATION_STRING && (classKeys.length == 4)) {
            classNames = lyrObj.getBinaryClassNamesForLegend();
        }
                
        for (let index = classKeys.length - 1; index >= 0 ; index--) {
            this.legendContent.innerHTML += 
                '<li><span class="circle" style="background:' + lyrObj.getColorOfClass(classKeys[index]) + ';"></span> ' +  classNames[classKeys[index]] + ' </li>';
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