'use strict'

class Event extends Transition {
    constructor(environment, images, id) {
        super(EVENT, environment, images, id);

    }

    activate(context) {
        context.beginPath();
        context.lineWidth = 2;
        context.lineJoin = "mitre";
        context.setLineDash([0, 0]);
        context.strokeStyle = "rgba(0, 0, 255, 0.6)";

        context.rect(this.__center.x - 20, this.__center.y - 20, 40, 40);
        context.filter = 'blur(1px)';
        context.stroke();
        context.filter = 'none';

    }
    
    draw(context) {
        context.save();

        context.beginPath();
        context.lineWidth = 2;
        context.lineJoin = "mitre";
        context.setLineDash([0, 0]);
        context.strokeStyle = "rgba(0, 0, 0, 0.8)";

        context.fillStyle = this.__color;
        context.rect(this.__center.x - 16, this.__center.y - 16, 32, 32);
        context.fill();
        context.stroke();

        this.drawRuntime(context); 

        if (this.environment.decorate) {
            this.decorate(context);
        }

        context.globalAlpha = 1.0;

        this.drawLabel(context);

        context.restore();

    }

}