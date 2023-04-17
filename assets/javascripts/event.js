'use strict'

class Event extends Transition {
    constructor(environment, images, id) {
        super(0, environment, images, id);

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

        if (this.environment.decorate) {
            this.decorate(context);
        }

        context.globalAlpha = 1.0;

        this.drawLabel(context);

        context.restore();
    }

}