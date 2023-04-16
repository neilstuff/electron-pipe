'use strict'

class Action extends Transition {
    constructor(environment, images, id) {
        super(1, environment, images, id);

    }

    decorate(context) {

        if (this.__selected) {
            context.beginPath();
            context.strokeStyle = "rgba(0, 0, 255, 0.3)";

            context.lineWidth = 2;
            context.setLineDash([1, 1]);

            context.rect(this.__center.x - 18, this.__center.y - 18, 36, 36);

            context.stroke();
        } else if (this.__selectable) {
            context.beginPath();
            context.strokeStyle = "rgba(0, 0, 0, 0.1)";

            context.lineWidth = 2;
            context.setLineDash([1, 1]);

            context.rect(this.__center.x - 18, this.__center.y - 18, 36, 36);
            context.stroke();

        }

        if (this.environment.editors && this.selected) {

            if (this.__fillSelectable) {
                context.globalAlpha = 1.0;
            } else {
                context.globalAlpha = 0.6;
            }

            context.drawImage(this.__images[2], this.__center.x - 36, this.__center.y - 22);

            if (this.__renameSelectable) {
                context.globalAlpha = 1.0;
            } else {
                context.globalAlpha = 0.6;
            }

            context.drawImage(this.__images[3], this.__center.x - 36, this.__center.y + 4);
        }

        context.stroke();

    }

    draw(context) {
        context.save();

        context.beginPath();
        context.lineWidth = 2;
        context.lineJoin = "mitre";
        context.setLineDash([0, 0]);
        context.strokeStyle = "rgba(0, 0, 0, 0.5)";

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