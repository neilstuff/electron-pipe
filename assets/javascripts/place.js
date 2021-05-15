'use strict'

class Place extends Artifact {

    constructor(environment, images, id) {
        super(0, environment, images, id);


        this.__tokens = 0;

        this.__incrementSelectable = false;
        this.__decrementSelectable = false;

    }

    get tokens() {
        return this.__tokens;
    }

    set tokens(tokens) {
        this.__tokens = tokens;
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

        if (tokens == 1) {
            context.beginPath();
            context.fillStyle = "rgba(0, 0, 0, 0.6)";

            context.arc(this.__center.x, this.__center.y, 5, 0, 2 * Math.PI);
            context.fill();
        } else if (this.tokens > 1) {
            context.beginPath();
            context.fillStyle = "rgba(0, 0, 0, 0.6)";

            context.arc(this.__center.x, this.__center.y - 5, 3, 0, 2 * Math.PI);
            context.fill();
            this.drawTokenCount(context, tokens);
        }

    }

    decorate(context) {

        if (this.__selected) {
            context.beginPath();

            context.strokeStyle = "rgba(0, 0, 255, 0.2)";

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

        this.drawTokens(context, this.tokens);

        if (this.environment.editors) {
            if (this.__incrementSelectable) {
                context.globalAlpha = 1.0;
            } else {
                context.globalAlpha = 0.4;
            }

            context.drawImage(this.__images[0], this.__center.x + 18, this.__center.y - 20);
            context.stroke();

            if (this.__decrementSelectable) {
                context.globalAlpha = 1.0;
            } else {
                context.globalAlpha = 0.4;
            }

            context.drawImage(this.__images[1], this.__center.x + 18, this.__center.y + 4);
            context.stroke();

        }

        context.globalAlpha = 1.0;

    }

    draw(context) {

        context.beginPath();
        context.strokeStyle = "rgba(0, 0, 0, 0.5)";
        context.lineWidth = 2;
        context.setLineDash([1, 0]);
        context.fillStyle = "rgba(255, 255, 255, 1.0)";
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

        if (!this.environment.editors) {
            this.__incrementSelectable = false;
            this.__decrementSelectable = false;

            return;

        }

        let x = mousePos.x;
        let y = mousePos.y;

        this.__incrementSelectable = false;
        this.__decrementSelectable = false;

        if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.__incrementSelectable = true;
            return true;
        }

        if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.__decrementSelectable = true;
            return true;
        }

        return false;

    }

    action(editor, mousePos) {

        if (!this.environment.editors) {
            this.__incrementSelectable = false;
            this.__decrementSelectable = false;

            return;

        }

        let x = mousePos.x;
        let y = mousePos.y;

        if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {

            this.incrementToken();
        }
        if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.decrementToken();
        }

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