export class Controllers {

    constructor(){
        this.controls = document.getElementById('controls');
        this.controls2 = document.getElementById('controls2');
        this.isDisplayed = false;
    }

    createControllers(){
        this.controls.className = 'inline-block';
        this.controls2.className = 'inline-block';
        this.controls2.style.top = (this.controls.offsetHeight) + 'px';
        this.isDisplayed = true;      
    }

    clearControls(){
        
        if (this.controls !== null) {
            //CLEAR PREVIOUS CONTENT
            this.controls.className = 'none-block';
            this.controls2.className = 'none-block';
            this.isDisplayed = false;
        }
    }
}