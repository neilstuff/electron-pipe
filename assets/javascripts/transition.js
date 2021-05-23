'use strict'

class Transition extends Artifact {
    constructor(environment, images, id) {
        super(1, environment, images, id);

        this.__editSelectable = false;
        this.__editing = false;

        this.__color = 'rgba(0,0,0,1.0)';

        this.__frame = 'frame';

        this.reset();

    }

    set color(color) {
        this.__color = color;
    }

    set frame(frame) {
        this.__frame = frame;
    }

    reset(status = false) {
        this.__incrementSelectable = status;
        this.__decrementSelectable = status;
        this.__fillSelectable = status;
        this.__renameSelectable = status;
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

    edit(editor) {
        var node = document.createElement("div");
        var transition = this;
        $(`#${this.__frame}`)[0].appendChild(node);

        node.setAttribute('style', `display:inline-block; position:absolute; ` +
            `left: ${this.__center.x - 12}px; ` +
            `top: ${this.__center.y - 30}px;` +
            `z-index: 2; padding:4px;"`);

        var picker = new Picker({
            parent: node,
            color: transition.__color,
            onDone: function(color) {
                transition.__editing = false;
                transition.__color = color.rgbaString;
                editor.draw();

            },
            onClose: function(color) {
                $('#frame')[0].removeChild(node);
                transition.__editing = false;
                editor.draw();
            }

        });

        this.__editing = true;

        picker.openHandler();

    }

    actionable(mousePos) {

        if (!this.environment.editors) {
            this.reset();
            return;

        }

        let x = mousePos.x;
        let y = mousePos.y;

        this.reset();

        if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.__fillSelectable = true;
            return true;
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.__renameSelectable = true;
            return true;
        }

        return false;

    }

    action(editor, mousePos) {

        if (!this.environment.editors) {
            this.reset();
            return;

        }

        let x = mousePos.x;
        let y = mousePos.y;

        if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.edit(editor);
        }

    }

    dblclick(editor, mousePos) {

        return true;

    }

    get serialize() {

        return {
            id: this.__id,
            type: this.__type,
            label: this.__label,
            color: this.__color,
            center: {
                x: this.x,
                y: this.y
            }

        }

    }

}