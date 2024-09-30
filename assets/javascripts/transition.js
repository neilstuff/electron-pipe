'use strict'

class Transition extends Artifact {
    constructor(type, environment, images, id) {
        super(type, environment, images, id);

        this.__editSelectable = false;
        this.__editing = false;

        this.__category = TRANSITION;

        this.__color = 'rgba(255, 255, 255, 1.0)';
        this.__variance = 0;
        this.__runtime = 0;
        this.__inhibited = false;

        this.setStatus();

        this.setMenu([0, 0, 0, 1, 1, 1, 1, 0]);

    }

    get variance() {
        return this.__variance;
    }

    set variance(variance) {
        this.__variance = variance;
    }

    incrementVariance() {
        this.__variance += 1;
    }

    decrementVariance() {
        this.__variance -= this.__variance == 0 ? 0 : 1;
    }
    
    get runtime() {
        return this.__runtime;
    }

    set runtime(runtime) {
        this.__runtime = runtime;
    }


    get inhibited() {
        return this.__inhibited;
    }

    set inhibited(inhibited) {
        this.__inhibited = inhibited;
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

        }

        this.drawMenu(context);

        context.stroke();

    }

    drawRuntime(context) {

        let offset = this.getTextWidth(this.__runtime + " " + String.fromCharCode(177) + " " + this.__variance, "12px Arial");

        context.fillStyle = "rgba(0, 0, 0, 0.8)";
        context.font = "12px Arial";

        context.fillText(this.__runtime + " " + String.fromCharCode(177) + " " + this.__variance, this.__center.x - (offset / 2), this.__center.y - 24);

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
            this.__runtimeSelectable = true;
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
            this.incrementVariance();
        } else if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.decrementVariance();
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.editRuntime(editor);
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.rename(editor);
        }
    }

    editRuntime(editor) {
        var node = document.createElement("input");
        var artifact = this;

        node.setAttribute("type", "number");
        node.value = this.__runtime;

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

            artifact.__runtime = node.value;
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
            runtime: this.__runtime,
            variance: this.__variance,
            center: {
                x: this.x,
                y: this.y
            }

        }

    }

}