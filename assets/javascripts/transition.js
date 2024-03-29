'use strict'

class Transition extends Artifact {
    constructor(type, environment, images, id) {
        super(type, environment, images, id);

        this.__editSelectable = false;
        this.__editing = false;

        this.__category = TRANSITION;

        this.__color = 'rgba(255, 255, 255, 1.0)';
        this.__measure = 0;
        this.__confidence = 100;

        this.setStatus();

        this.setMenu([0, 0, 0, 1, 1, 1, 1, 0]);

    }

    get measure() {
        return this.__measure;
    }

    set measure(measure) {
        this.__measure = measure;
    }

    get confidence() {
        return this.__confidence;
    }

    set confidence(confidence) {
        this.__confidence = confidence;
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

        if (this.selected) {

            context.fillStyle = "rgba(0, 0, 0, 0.5)";
            context.font = "12px Arial";

            if (this.__confidence < 100) {
                context.fillText(this.__confidence.toString(), this.__center.x + 23, this.__center.y + 4);
            } else {
                context.fillText(this.__confidence.toString(), this.__center.x + 19, this.__center.y + 4);

            }

        }

        this.drawMenu(context);

        context.stroke();

    }

    drawMeasure(context) {

        this.drawDonut(context, this.__center.x, this.__center.y, 7, 0, Math.PI * 2, 5, "#fff", this.__confidence);

        let offset = this.getTextWidth(this.__measure + " ms", "12px Arial");

        context.fillStyle = "rgba(0, 0, 0, 0.5)";
        context.font = "12px Arial";

        context.fillText(this.__measure + " ms", this.__center.x - (offset / 2), this.__center.y - 24);

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
            this.__increaseSelectable = true;
            return true;
        } else if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.__decreaseSelectable = true;
            return true;
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.__renameSelectable = true;
            return true;
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.__measureSelectable = true;
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
            this.incrementConfidence();
        } else if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.decrementConfidence();
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.measure(editor);
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.rename(editor);
        }

    }

    incrementConfidence() {

        this.__confidence = (this.__confidence == 100) ? 100 : this.__confidence + 1;

    }

    decrementConfidence() {

        this.__confidence = (this.__confidence == 0) ? 0 : this.__confidence - 1;

    }

    measure(editor) {
        var node = document.createElement("input");
        var artifact = this;

        node.setAttribute("type", "number");
        node.value = this.__measure;

        $(`#${this.__frame}`)[0].appendChild(node);

        node.setAttribute('style', `display:inline-block; position:absolute; ` +
            `left: ${this.__center.x - 80}px; ` +
            `top: ${this.__center.y - 52}px;` +
            `width: 100px;` +
            `z-index: 2; padding:4px;` +
            `border:1px solid rgba(0,0,0,0.4);` +
            `background-color:rgba(255,255,255,1.0);"`);

        node.focus();

        node.addEventListener("blur", function() {

            artifact.__measure = node.value;
            artifact.updateArcs();

            editor.draw();

            editor.__treeMap[artifact.id].text = node.value;
            editor.__tree.drawTree();

            node.parentNode.removeChild(node);

        });

    }

    dblclick(editor, mousePos) {

        return true;

    }

    get serialize() {

        return {
            id: this.__id,
            type: this.__type,
            label: this.__label,
            measure: this.__measure,
            confidence: this.__confidence,
            center: {
                x: this.x,
                y: this.y
            }

        }

    }

}