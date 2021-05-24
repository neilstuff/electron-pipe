'use strict'

class Place extends Artifact {

    constructor(environment, images, id) {
        super(0, environment, images, id);


        this.__tokens = 0;

        this.__editing = false;
        this.__color = 'rgba(255, 255, 255, 1.0)';

        this.__frame = 'frame';

        this.setStatus();

    }

    get tokens() {
        return this.__tokens;
    }

    set tokens(tokens) {
        this.__tokens = tokens;
    }

    setStatus(status = false) {
        this.__incrementSelectable = status;
        this.__decrementSelectable = status;
        this.__fillSelectable = status;
        this.__renameSelectable = status;
    }

    drawTokenCount(context, tokens) {
        function getTextWidth(text, font) {
            var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
            var context = canvas.getContext("2d");
            context.font = font;
            var metrics = context.measureText(text);
            return metrics.width;
        }

        let count = `${this.__tokens}`;
        let offset = getTextWidth(count, "12px Arial");

        context.fillStyle = "rgba(0, 0, 0, 0.5)";
        context.font = "12px Arial";
        context.fillText(count, this.__center.x - (offset / 2), this.__center.y + 11);

    }

    drawFill(context) {

        if (this.id in this.environment.placeStateMap) {
            this.drawTokens(context, this.environment.placeStateMap[this.id].tokens,
                this.environment.placeStateMap[this.id].color);
        }

    }

    drawTokens(context, tokens, color = "rgba(0,0,0,0.6)") {

        context.fillStyle = this.__color == 'rgba(255, 255, 255, 1.0)' ? 'rgba(0, 0, 0, 0.9)' : this.__color;
        context.setLineDash([1, 0]);

        if (tokens == 1) {
            context.beginPath();
            context.arc(this.__center.x, this.__center.y, 5, 0, 2 * Math.PI);
            context.fill();
            context.stroke();
        } else
        if (this.tokens > 1) {
            context.beginPath();


            context.arc(this.__center.x, this.__center.y - 5, 3, 0, 2 * Math.PI);
            context.fill();
            context.stroke();
            this.drawTokenCount(context, tokens);
        }

    }

    decorate(context) {

        if (this.__selected) {
            context.save();
            context.beginPath();

            context.strokeStyle = "rgba(0, 0, 255, 0.2)";

            context.lineWidth = 2;
            context.setLineDash([1, 1]);

            context.rect(this.__center.x - 18, this.__center.y - 18, 36, 36);

            context.stroke();
            context.restore();

        } else if (this.__selectable) {
            context.save();
            context.beginPath();
            context.strokeStyle = "rgba(0, 0, 0, 0.1)";

            context.lineWidth = 2;
            context.setLineDash([1, 1]);

            context.rect(this.__center.x - 18, this.__center.y - 18, 36, 36);

            context.stroke();
            context.restore();

        }
        context.save();

        this.drawTokens(context, this.tokens);

        context.restore();

        if (this.environment.editors && this.selected) {

            if (this.__incrementSelectable) {
                context.globalAlpha = 1.0;
            } else {
                context.globalAlpha = 0.6;
            }

            context.drawImage(this.__images[0], this.__center.x + 18, this.__center.y - 20);

            if (this.__decrementSelectable) {
                context.globalAlpha = 1.0;
            } else {
                context.globalAlpha = 0.6;
            }

            context.drawImage(this.__images[1], this.__center.x + 18, this.__center.y + 4);

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

        context.globalAlpha = 1.0;

    }

    draw(context) {

        context.beginPath();
        context.strokeStyle = "rgba(0, 0, 0, 0.4)";
        context.lineWidth = 2;
        context.setLineDash([1, 0]);
        context.fillStyle = this.__color.replace(',1)', ',0.3)');
        context.arc(this.__center.x, this.__center.y, 16, 0, 2 * Math.PI);
        context.fill();
        context.stroke();

        if (this.environment.decorate) {
            this.decorate(context);
        } else {
            this.drawFill(context);
        }

        this.drawLabel(context);

    }

    incrementToken() {

        this.__tokens = this.__tokens + 1;

    }

    decrementToken() {

        this.__tokens = (this.__tokens == 0) ? 0 : this.__tokens - 1;

    }

    actionable(mousePos) {
        let x = mousePos.x;
        let y = mousePos.y;

        this.setStatus(false);

        if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.__incrementSelectable = true;
            return true;
        } else if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.__decrementSelectable = true;
            return true;
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
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

        if (!this.environment.editors && !this.selected) {
            this.setStatus(false);
            return;
        }

        let x = mousePos.x;
        let y = mousePos.y;

        if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.incrementToken();
        } else if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.decrementToken();
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.edit(editor);
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.rename(editor);
        }

    }

    edit(editor) {
        var node = document.createElement("div");
        var place = this;
        $(`#${this.__frame}`)[0].appendChild(node);

        node.setAttribute('style', `display:inline-block; position:absolute; ` +
            `left: ${this.__center.x - 12}px; ` +
            `top: ${this.__center.y - 30}px;` +
            `z-index: 2; padding:4px;"`);

        var picker = new Picker({
            parent: node,
            color: place.__color,
            onDone: function(color) {
                place.__editing = false;
                place.__color = color.rgbaString;
                editor.draw();

            },
            onClose: function(color) {
                $('#frame')[0].removeChild(node);
                place.__editing = false;
                editor.draw();
            }

        });

        this.__editing = true;

        picker.openHandler();

    }

    rename(editor) {
        var node = document.createElement("input");
        var place = this;

        node.setAttribute("type", "text");
        node.value = this.label;

        $(`#${this.__frame}`)[0].appendChild(node);

        node.setAttribute('style', `display:inline-block; position:absolute; ` +
            `left: ${this.__center.x - 80}px; ` +
            `top: ${this.__center.y + 16}px;` +
            `width: 100px;` +
            `z-index: 2; padding:4px;` +
            `border:1px solid rgba(0,0,0,0.4);` +
            `background-color:rgba(255,255,255,1.0);"`);

        node.focus();

        node.addEventListener("blur", function() {

            place.label = node.value;

            place.updateArcs();

            editor.draw();

            editor.__treeMap[place.id].text = node.value;
            editor.__tree.drawTree();

            node.parentNode.removeChild(node);

        });

        node.addEventListener("keypress", function(event) {

            if (event.key === 'Enter') {

                node.style.display = 'none';

                event.stopPropagation();

                return false;

            }

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
            tokens: this.__tokens,
            center: {
                x: this.x,
                y: this.y
            }
        }

    }

}