var EVALUATION_STRING = 'evaluation';

export class Legend {

    constructor(){
        this.legend = document.getElementById('legend');
        this.legendContent = document.getElementById('legend-content');
    }

    createLegend(lyrObj, layerOL){

        this.legendContent.innerHTML = '<h4><b><u>Legenda</u></b></h4>';

        const classKeys = lyrObj.getKeysOfClasses();
        let classNames = lyrObj.getClassNames();
        let classNamesWrong = {};
        let countParentLabels = 0;

        // IF IT'S BINARY CLASS WE CAN GET TP, TN, FP, FN to the class name for
        // a better understanding of legend/map
        if (lyrObj.getType() == EVALUATION_STRING && (classKeys.length == 4)) {
            classNames = lyrObj.getBinaryClassNamesForLegend();
        }

        // Some task was done to improve the legend according the
        // number of classes, however it's not finish, the legend is using the
        // name of class provide in the geojson.
        //
        // TODO
        for (let index = classKeys.length - 1; index >= 0 ; index--) {
            const classKey = classKeys[index];
            const colorClass = lyrObj.getColorOfClass(classKey);
            const isInactiveClasse = layerOL.get('inactiveClasses')[classKeys[index]];
            const className = classNames[classKeys[index]];

            this.legendContent.appendChild(this.getChildLabelToLegend(index, className, 
                isInactiveClasse, colorClass, classKey, layerOL));

            /////////////////////////////////////////
            // TODO - related to the comment above //
            /////////////////////////////////////////

            // const valueOfValidationAndClassification = classNames[classKey].split(' | ');
            // const classification = valueOfValidationAndClassification[0].split(' (')[0];
            // const validation = valueOfValidationAndClassification[1].split(' (')[0];
            
            // console.log('validation: ' + validation);
            // console.log('classification: ' + classification);

            // if (validation == classification) {
            //     const className = validation + ' (Acerto)';
            //     this.legendContent.appendChild(this.getChildLabelToLegend(index, className, 
            //         isInactiveClasse, colorClass, classKey, layerOL));
            // } else {
            //     const className = validation + ' (Erro)';

            //     if (!classNamesWrong[className]) {
            //         classNamesWrong[className] = this.getParentLabelToLegend(countParentLabels, className);
            //         countParentLabels++;
            //     }

            //     classNamesWrong[className].firstElementChild.appendChild(this.getChildLabelToLegend(index, classification, 
            //         isInactiveClasse, colorClass, classKey, layerOL));
            // }
        }

        /////////////////////////////////////////
        // TODO - related to the comment above //
        /////////////////////////////////////////
        
        // let listOfErrosLabels = Object.values(classNamesWrong);

        // for (let index = listOfErrosLabels.length - 1; index >= 0 ; index--) {
        //     const element = listOfErrosLabels[index];
        //     this.legendContent.appendChild(element);
        // }

        this.legend.className = 'inline-block';
    }

    clearLegend(){
        if (this.legend !== null) {
            //CLEAR PREVIOUS CONTENT
            this.legendContent.innerHTML = '';
            this.legend.className = 'none-block';
        }
    }
    
    getParentLabelToLegend(index, className){
        let parentLabel = document.createElement('div');
        parentLabel.textContent = className;
        parentLabel.id = 'legend-' + index;
        parentLabel.style.cursor = 'pointer';
        parentLabel.style.zIndex = 3000;
        let ulElement = document.createElement('ul');
        ulElement.style.display = 'none';

        parentLabel.appendChild(ulElement);

        return parentLabel;
    }

    getChildLabelToLegend(index, className, isInactiveClasse, colorClass, classKey, layerOL){

        let childLabel = document.createElement('li');
        let spanLabel = document.createElement('span');
        spanLabel.id = 'circle-legend-' + index;
        spanLabel.className = 'circle';
        spanLabel.style.cursor = 'pointer';
        spanLabel.style.background = isInactiveClasse ? 'rgba(0,0,0,0)' : colorClass ;
        spanLabel.style.border = 'solid';
        spanLabel.style.borderWidth = '0.5px';
        this.addActionToLegend(spanLabel, classKey, colorClass, layerOL);
        childLabel.appendChild(spanLabel);

        let labelName = document.createElement('span');
        labelName.textContent = ' ' + className;
        childLabel.appendChild(labelName);

        return childLabel;
    }

    addActionToLegend(circleElement, classKey, colorClass, layerOL){
        circleElement.onclick = function(){
            const isClassVisible = layerOL.get('inactiveClasses')[classKey];
            circleElement.style.background = !isClassVisible ? 'rgba(0,0,0,0)' : colorClass ;
            // circleElement.style.border = !isClassVisible ? 'solid' : 'none';
            // circleElement.style.borderWidth = !isClassVisible ? '0.5px' : '0px';
            layerOL.get('inactiveClasses')[classKey] = !isClassVisible;
            layerOL.getSource().dispatchEvent('change');
        };
    }
}