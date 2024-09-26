'use strict'
class Activator extends Graphics {
    constructor(canvas, transition) {
        super();

        this.__context = canvas.getContext('2d');
        this.__elapsed = 0;
        this.__transition = transition;
        this.__duration = 0;
        this.__elapsed = 0;

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

    activate() {
      
        this.duration = this.transition.runtime;

        console.log("Activate - " + this.duration + ":" + this.transition.runtime + ":" +  this.transition.variance);
        this.elapsed = this.duration;

    }

    progress(unit) {

        console.log("Progress - " + this.duration + ":" + this.transition.runtime + ":" +  this.transition.variance );
        this.elapsed =  this.elapsed - unit < 0 ? 0 : this.elapsed - unit;
   

    }

    draw() {

        this.transition.draw(this.__context);

        if (this.elapsed > 0) {
            this.drawDonut(this.__context, this.transition.center.x, this.transition.center.y, 7, 0, Math.PI * 2, 5, "#fff", (this.elapsed * 100)/this.duration);
        }

    }

}


