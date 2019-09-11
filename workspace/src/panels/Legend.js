var EVALUATION_STRING = 'evaluation';

export class Legend {

    constructor(){
        this.legend = document.getElementById('legend');
        this.legendContent = document.getElementById('legend-content');
    }

    createLegend(lyrObj, layerOL){
        const classKeys = lyrObj.getKeysOfClasses();

        this.legendContent.innerHTML = '<h6><b><u>Legend</u></b></h6>';

        var classNames = lyrObj.getClassNames();

        if (lyrObj.getType() == EVALUATION_STRING && (classKeys.length == 4)) {
            classNames = lyrObj.getBinaryClassNamesForLegend();
        }
                
        for (let index = classKeys.length - 1; index >= 0 ; index--) {

            this.legendContent.innerHTML += 
                '<li><span id="circle-legend-' + index + '" class="circle" style="cursor: pointer;"></span> ' +  classNames[classKeys[index]] + ' </li>';
            
            document.getElementById('circle-legend-' + index).style.background = layerOL.get('inactiveClasses')[index + 1] ? 'rgba(0,0,0,0)' : lyrObj.getColorOfClass(classKeys[index]) ;
            document.getElementById('circle-legend-' + index).style.border = layerOL.get('inactiveClasses')[index + 1] ? 'solid' : 'none';
            document.getElementById('circle-legend-' + index).style.borderWidth = layerOL.get('inactiveClasses')[index + 1] ? '0.5px' : '0px';
            
            layerOL.getSource().dispatchEvent('change');
        }   

        for (let index = classKeys.length - 1; index >= 0 ; index--) {
            document.getElementById('circle-legend-' + index).onclick = function(){
                document.getElementById('circle-legend-' + index).style.background = !layerOL.get('inactiveClasses')[index + 1] ? 'rgba(0,0,0,0)' : lyrObj.getColorOfClass(classKeys[index]) ;
                document.getElementById('circle-legend-' + index).style.border = !layerOL.get('inactiveClasses')[index + 1] ? 'solid' : 'none';
                document.getElementById('circle-legend-' + index).style.borderWidth = !layerOL.get('inactiveClasses')[index + 1] ? '0.5px' : '0px';
                layerOL.get('inactiveClasses')[index + 1] = !layerOL.get('inactiveClasses')[index + 1];
                layerOL.getSource().dispatchEvent('change');
            };
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