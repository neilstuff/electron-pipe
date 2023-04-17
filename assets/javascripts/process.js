'use strict'

class Process extends Transition {
    constructor(environment, images, id) {
        super(1, environment, images, id);

    }


    draw(context) {

        context.save();
        context.beginPath();

        var cx = this.__center.x;
        var cy = this.__center.y;
        var notches = 8;
        var radiusO = 16;
        var radiusI = 12;
        var taperO = 9;
        var taperI = 3;

        // pre-calculate values for loop

        var pi2 = 2 * Math.PI;
        var angle = pi2 / (notches * 2); // angle between notches
        var taperAI = angle * taperI * 0.005; // inner taper offset (100% = half notch)
        var taperAO = angle * taperO * 0.005; // outer taper offset
        var toggle = false; // notch radius level (i/o)

        context.lineWidth = 2;
        context.strokeStyle = "rgba(0, 0, 0, 0.8)";
        context.fillStyle = this.__color;

        for (var iAngle = angle; iAngle <= pi2 + angle; iAngle += angle, toggle = !toggle) {

            // draw inner to outer line
            if (toggle) {
                context.lineTo(cx + radiusI * Math.cos(iAngle - taperAI),
                    cy + radiusI * Math.sin(iAngle - taperAI));
                context.lineTo(cx + radiusO * Math.cos(iAngle + taperAO),
                    cy + radiusO * Math.sin(iAngle + taperAO));
            }

            // draw outer to inner line
            else {
                context.lineTo(cx + radiusO * Math.cos(iAngle - taperAO), // outer line
                    cy + radiusO * Math.sin(iAngle - taperAO));
                context.lineTo(cx + radiusI * Math.cos(iAngle + taperAI), // inner line
                    cy + radiusI * Math.sin(iAngle + taperAI));
            }

        }

        context.closePath();
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