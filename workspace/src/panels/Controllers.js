export class Controllers {

    constructor(){
        this.controls = document.getElementById('controls');
        this.isDisplayed = false;
    }

    createControllers(){
        this.controls.className = 'inline-block';
        this.isDisplayed = true;      
    }

    clearControls(){
        
        if (this.controls !== null) {
            //CLEAR PREVIOUS CONTENT
            this.controls.className = 'none-block';
            this.isDisplayed = false;
        }
    }
}