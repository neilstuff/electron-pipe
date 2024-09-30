'use strict'
class Activator extends Graphics {
    constructor(canvas, transition) {
        super();

        this.__context = canvas.getContext('2d');
        this.__elapsed = 0;
        this.__transition = transition;
        this.__duration = 0;
        this.__elapsed = 0;
        this.__processed = false;
        this.__enabled = false;
        this.__selectable = true;
        this.__color = (transition.type == EVENT) ? "rgba(0, 0, 255, 0.6)" : rgba(1, 50, 32, 0.6);

    }

    get elapsed() {
        return this.__elapsed;
    }

    set elapsed(elapsed) {
        this.__elapsed = elapsed;
    }

    get duration() {
        return this.__duration;
    }

    set duration(duration) {
        this.__duration = duration;
    }

    get transition() {
        return this.__transition;
    }

    get processed() {
        return this.__processed;
    }

    set processed(processed) {
        this.__processed = processed;
    }

    get enabled() {
        return this.__enabled;
    }

    set enabled(enabled) {
        this.__enabled = enabled;
    }

    get selectable() {
        return this.__selectable;
    }

    set selectable(selectable) {
        this.__selectable = selectable;
    }

    isEnabled() {

        return this.enabled;

    }

    isActive() {

        return this.elapsed > 0;

    }

    isSelectable() {

        return this.__selectable;

    }

    activate() {

        this.duration = this.transition.runtime;

        this.elapsed = this.duration;

    }

    progress(unit) {

        this.elapsed = this.elapsed - unit < 0 ? 0 : this.elapsed - unit;

    }

    draw(a) {

        this.__transition.draw(this.__context);
 
        if (this.__enabled && this.__selectable) {
            this.__context.save();
            this.__context.beginPath();
            this.__context.lineWidth = 2;
            this.__context.lineJoin = "mitre";
            this.__context.setLineDash([0, 0]);
            this.__context.strokeStyle = this.__color;

            this.__context.rect(this.transition.__center.x - 20, this.transition.__center.y - 20, 40, 40);
            this.__context.filter = 'blur(1px)';
            this.__context.stroke();
            this.__context.filter = 'none';
            this.__context.restore();
        }
 
        if (this.elapsed > 0) {
            this.drawDonut(this.__context, this.transition.center.x, this.transition.center.y, 7, 0, Math.PI * 2, 5, "#fff", (this.elapsed * 100) / this.duration);
        }
       
    }

}


