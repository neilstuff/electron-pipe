'use strict'

class Transition extends Artifact {
    constructor(subtype, environment, images, id) {
        super(1, environment, images, id);

        this.__editSelectable = false;
        this.__editing = false;
        this.__subtype = subtype;

        this.__color = 'rgba(255, 255, 255, 1.0)';
        this.__timer = 0;
        this.__timer = 0;

        this.setStatus();

        this.setMenu([0,0,1,1,0,0]);
    
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

        this.drawMenu(context);

        context.stroke();

    }

    drawTimer(context) {
        function getTextWidth(text, font) {
            var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
            var context = canvas.getContext("2d");
            context.font = font;
            var metrics = context.measureText(text);
            return metrics.width;
        }

        let offset = getTextWidth(this.__timer.toString(), "12px Arial");

        context.fillStyle = "rgba(0, 0, 0, 0.5)";
        context.font = "12px Arial";
        context.fillText(this.__timer.toString(), this.__center.x - (offset / 2), this.__center.y + 4);

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

    actionable(mousePos) {
        let x = mousePos.x;
        let y = mousePos.y;

        this.setStatus(false);

        if (this.showMenu) {
            return false;
        }

        if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.__incrementSelectable = true;
            return true;
        } else if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.__incrementSelectable = true;
            return true;
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.__decrementSelectable = true;
            return true;
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.__renameSelectable = true;
            return true;
        }

        return false;

    }

    action(editor, mousePos) {

        if (this.within(mousePos)) {
            this.showMenu = true;
        }

        if (!this.environment.editors || !this.selected) {
            this.setStatus(false);
            return;
        }

        let x = mousePos.x;
        let y = mousePos.y;
        if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.incrementTimer();
        } else if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.decrementTimer();
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.fill(editor);
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.rename(editor);
        }

    }

    incrementTimer() {

        this.__timer = this.__timer + 1;

    }

    decrementTimer() {

        this.__timer = (this.__timer == 0) ? 0 : this.__timer - 1;

    }

    dblclick(editor, mousePos) {

        return true;

    }

    get serialize() {

        return {
            id: this.__id,
            type: this.__type,
            label: this.__label,
            timer: this.__timer,
            color: this.__color,
            center: {
                x: this.x,
                y: this.y
            }

        }

    }

}