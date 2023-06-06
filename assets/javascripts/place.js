'use strict'

class Place extends Artifact {

    constructor(environment, images, id) {
        super(0, environment, images, id);

        this.__tokens = 0;

        this.__editing = false;
        this.__color = 'rgba(255, 255, 255, 1.0)';
        this.__icon = null;


        this.setStatus();

        this.setMenu([1, 1, 0, 1, 0, 0, 0, 1]);

    }

    get menu() {
        return this.__menu;
    }

    get tokens() {
        return this.__tokens;
    }

    set tokens(tokens) {
        this.__tokens = tokens;
    }

    drawTokenCount(context, tokens) {
        let count = `${this.__tokens}`;
        let offset = this.getTextWidth(count, "12px Arial");

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
        } else if (this.tokens > 1) {
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

        this.drawMenu(context);

        context.globalAlpha = 1.0;

    }

    draw(context) {

        context.beginPath();
        context.strokeStyle = "rgba(0, 0, 0, 0.9)";
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

        if (this.__icon) {
            context.save();
            context.globalAlpha = (this.__selected) ? 1.0 : 0.2;

            var image = new Image();
            image.src = this.__icon;

            context.fillStyle = '#FFF';
            context.fillRect(this.__center.x - 16, this.__center.y - 54, 32, 32);
            context.drawImage(image, this.__center.x - 16, this.__center.y - 54, 32, 32);
            context.restore();
        }

        this.drawLabel(context);

    }

    incrementToken() {

        this.__tokens = this.__tokens + 1;

    }

    decrementToken() {

        this.__tokens = (this.__tokens == 0) ? 0 : this.__tokens - 1;

    }

    loadIcon() {
        var __this = this;

        this.loadFile(".png", async function(files) {
            let icon = await __this.base64Upload(files[0]);

            __this.__icon = icon['default'];

        });

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

        if (this.within(mousePos)) {
            this.showMenu = true;
        }

        if (!this.environment.editors && !this.selected && !this.showMenu) {
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
            this.loadIcon(editor);
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.rename(editor);
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
            tokens: this.__tokens,
            center: {
                x: this.x,
                y: this.y
            }
        }

    }

}