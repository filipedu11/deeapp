/**
 * Renders a progress bar.
 * @param {Element} el The target element.
 * @constructor
 */
export class Progress {
    constructor(el) {
        this.el = el;
        this.loading = 0;
        this.loaded = 0;
    }
    /**
     * Increment the count of loading tiles.
     */
    addLoading() {
        if (this.loading === 0) {
            this.show();
        }
        ++this.loading;
        this.update();
    }
    /**
     * Increment the count of loaded tiles.
     */
    addLoaded() {
        var this_ = this;
        setTimeout(function () {
            ++this_.loaded;
            this_.update();
        }, 100);
    }
    /**
     * Update the progress bar.
     */
    update() {
        var width = (this.loaded / this.loading * 100).toFixed(1) + '%';
        this.el.style.width = width;
        if (this.loading === this.loaded) {
            this.loading = 0;
            this.loaded = 0;
            var this_ = this;
            setTimeout(function () {
                this_.hide();
            }, 500);
        }
    }
    /**
     * Show the progress bar.
     */
    show() {
        this.el.style.visibility = 'visible';
    }
    /**
     * Hide the progress bar.
     */
    hide() {
        if (this.loading === this.loaded) {
            this.el.style.visibility = 'hidden';
            this.el.style.width = 0;
        }
    }
}