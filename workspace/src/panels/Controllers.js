export class Controllers {

    constructor(){
        this.controls = document.getElementById('controls');
        this.controlsContent = document.getElementById('controls-content');
        this.isDisplayed = false;
    }

    createControllers(){
        this.controlsContent.innerHTML = '<h6><b><u>Controllers</u></b></h6>';
        this.controls.className = 'inline-block';
        this.filterAreawithNumber();      
        this.isDisplayed = true;      
    }

    filterAreawithNumber(){

        var slideCont = document.createElement('div');
        slideCont.className= 'slidecontainer';
        var slideLabel = document.createElement('label');
        slideLabel.className= 'slidelabel';
        slideLabel.innerHTML = '<b>Área em Ha</b><br/>';

        this.currentValue = document.createElement('input');
        this.currentValue.id = 'area-number';
        this.currentValue.type = 'number';
        this.currentValue.align = 'center';
        this.currentValue.value = 0;
        
        slideLabel.appendChild(this.currentValue);
        slideCont.appendChild(slideLabel);
        this.controlsContent.append(slideCont);
    }

    clearControls(){
        
        if (this.controls !== null) {
            //CLEAR PREVIOUS CONTENT
            this.controlsContent.innerHTML = '';
            this.controls.className = 'none-block';
            this.isDisplayed = false;
        }
    }
}