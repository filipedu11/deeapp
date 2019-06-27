

export class Legend {

    constructor(lyrObj){
        this.lyrObj = lyrObj;
        this.dec = lyrObj.getDecode();
    }

    createLegend(){
        
        var legend = document.getElementById('legend');
        var legendContent = document.getElementById('legend-content');
        var cStatsArray = this.lyrObj.getClassStats();

        legendContent.innerHTML = '<h6><b><u>Legend</u></b></h6>';
                
        for (let index = 0; index < cStatsArray.length; index++) {
            const classEl = cStatsArray[index];

            console.log(this.dec);
            console.log(this.dec.key);
            console.log(classEl);

            legendContent.innerHTML += 
                '<li><span class="circle" style="background:' + this.lyrObj.getColorOfClass(classEl[this.dec.classID[this.dec.key]]) + ';"></span> ' + classEl[this.dec.className[this.dec.key]] + ' </li>';
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