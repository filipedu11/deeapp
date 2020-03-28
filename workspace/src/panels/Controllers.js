export class Controllers {

    constructor(){
        this.mainControllers = document.getElementById('controllers-main-board');
        this.controls = document.getElementById('controls');
        this.controls2 = document.getElementById('controls2');
        this.isDisplayed = false;
    }

    displayControllers(){
        this.mainControllers.className = 'inline-block';
        this.isDisplayed = true;      
    }

    hideControls(){
        
        if (this.controls !== null) {
            //CLEAR PREVIOUS CONTENT
            this.mainControllers.className = 'none-block';
            this.isDisplayed = false;
        }
    }
}