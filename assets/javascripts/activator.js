'use strict'
class Activator extends Graphics {
    constructor(canvas, transition) {
        super();

        this.__context = canvas.getContext('2d');
        this.__elapased = 0;
        this.__transition = transition;
        this.__duration = 0;

    }

    get elapsed() {
        return this.__elapased;
    }

    set elapsed(elapsed) {
        this.__elpased = elapsed;
    }
    
    get duration() {
        return this.__timer;
    }

    set duration(duration) {
        this.__duration = duration;
    }
        
    get transition() {
        return this.__transition;
    }

    get targetArcs() {
        return this.transition.targetArcs;
    }

    get sourceArcs() {
        return this.transition.sourceArcs;
    }

    activate() {

        this.__duration = this.transition.runtime + Math.floor((this.transition.runtime * Math.random() ) * this.transition.variance/100);

        console.log(this.__duration);

    }

    progress(unit) {

        this.__elapased =  this.__elapased - unit < 0 ? 0 : this.__elapased - unit;

    }

    draw() {

        this.transition.draw(this.__context);
        this.drawDonut(this.__context, this.transition.center.x, this.transition.center.y, 7, 0, Math.PI * 2, 5, "#fff", 100);

    }

}


