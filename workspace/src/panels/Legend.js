

export class Legend {

    constructor(lyrObj){
        this.lyrObj = lyrObj;
        this.dec = lyrObj.getDecode();
    }

    createLegend(){
        
        var legend = document.getElementById('legend');
        var legendContent = document.getElementById('legend-content');
        const classKeys = this.lyrObj.getKeysOfClasses();

        legendContent.innerHTML = '<h6><b><u>Legend</u></b></h6>';
                
        for (let index = 0; index <classKeys.length; index++) {

            legendContent.innerHTML += 
                '<li><span class="circle" style="background:' + this.lyrObj.getColorOfClass(classKeys[index]) + ';"></span> ' +  this.lyrObj.getNameOfClass(classKeys[index]) + ' </li>';
        }

        legend.className = 'inline-block';
    }

    clearLegend(){
        
        var legend = document.getElementById('legend');
        var legendContent = document.getElementById('legend-content');

        if (legend !== null) {
            //CLEAR PREVIOUS CONTENT
            legendContent.innerHTML = '';
            legend.className = 'none-block';
        }
    }
}