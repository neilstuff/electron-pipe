class Container extends Artifact {
    constructor(environment, images, id) {
        super(5, environment, images, id);

        this.__editSelectable = false;
        this.__editable = true;
        this.__joinable = false;

        this.__incrementSelectable = false;
        this.__decrementSelectable = false;
        this.__fillSelectable = false;

        this.__icon = null;

    }
    
    intersects(x, y) {
        var top = $(`#container_${this.__id}`)[0].offsetTop;
        var left = $(`#container_${this.__id}`)[0].offsetLeft;
        var width = $(`#container_${this.__id}`).width();
        var height = $(`#container_${this.__id}`).height();

        return (x >= left && x <= left + width + 28 &&
            y >= top && y <= top + height);

    }

    selectContained(rectangle) {

        this.selected = this.contains(rectangle);

    }

    contains(rectangle) {
        var top = $(`#container_${this.__id}`)[0].offsetTop;
        var left = $(`#container_${this.__id}`)[0].offsetLeft;
        var width = $(`#container_${this.__id}`).width();
        var height = $(`#container_${this.__id}`).height();

        return (rectangle.startX - 32 < left &&
            rectangle.endX + 32 > left + width &&
            rectangle.startY - 32 < top &&
            rectangle.endY + 32 > top + height);

    }

    selectOnIntersection(mousePos) {
        var top = $(`#container_${this.__id}`)[0].offsetTop;
        var left = $(`#container_${this.__id}`)[0].offsetLeft;
        var width = $(`#container_${this.__id}`).width();
        var height = $(`#container_${this.__id}`).height();

        this.__selectable = false;

        if (mousePos.x >= left && mousePos.x <= left + width + 48 &&
            mousePos.y >= top && mousePos.y <= top + height + 48) {
            this.__selectable = true;
        }

    }

    async draw(context) {

        context.save();
        context.globalAlpha = (this.__selected) ? 1.0 : 0.2;

        var image = new Image();
        image.src = this.__icon;

        context.fillStyle = '#FFF';
        context.fillRect(this.__center.x - 16, this.__center.y - 54, 32, 32);
        context.drawImage(image, this.__center.x - 16, this.__center.y - 54, 32, 32);
        context.restore();

    }

    create() {

        this.__node = document.createElement("div");
        this.__node.id = `container_${this.__id}`;
        this.__node.setAttribute('style', `display:inline-block; position:absolute; ` +
            `left: ${this.__center.x - 30}px; ` +
            `top: ${this.__center.y - 6}px;` +
            `border: solid 1px orange; z-index: 1; padding:4px;"`);

        this.__node.innerHTML = `<div><span id="html_${this.__id}" contenteditable="true" ` +
            `style="display:inline-block; margin-top:4px; font-size:16px; min-width:8px; min-height:16px; white-space:nowrap; ` +
            `outline: 0; background-color:rgba(255, 255, 255, 1.0);" ` +
            `onblur="leave('${this.__id}');" onkeypress="redraw('${this.__id}');"></span>` +
            `</div>`;

        $('#frame')[0].appendChild(this.__node);

        document.getElementById(`html_${this.__id}`).focus();

    }

    release() {
        document.getElementById(`html_${this.__id}`).blur();
    }

    destroy() {
        $('#frame')[0].removeChild(this.__node);
    }

    edit() {
        $(`#container_${this.__id}`).css('border', `solid 1px orange`);
        $(`#container_${this.__id}`).css('z-index', `1`);
        $(`#container_${this.__id}`).css('opacity', '1.0');

        document.getElementById(`html_${this.__id}`).focus();

        this.__editable = true;

    }

    show() {
        $(`#container_${this.__id}`).css('z-index', '1');
        $(`#container_${this.__id}`).css('border', 'dashed 1px rgba(0,0,0,0.6)');
        $(`#container_${this.__id}`).css('opacity', '0.8');

        this.__editable = false;
    }

    redraw(context) {
        this.__editable = true;
        this.draw(context)
    }

    actionable(mousePos) {

        if (!this.environment.editors) {
            this.__incrementSelectable = false;
            this.__decrementSelectable = false;
            this.__fillSelectable = false;
        }

        var top = $(`#container_${this.__id}`)[0].offsetTop;
        var left = $(`#container_${this.__id}`)[0].offsetLeft;
        var width = $(`#container_${this.__id}`).width();
        var height = $(`#container_${this.__id}`).height();

        this.__editSelectable = false;
        this.__incrementSelectable = false;
        this.__decrementSelectable = false;
        this.__fillSelectable = false;
        this.__iconSelectable = false;

        if (mousePos.x >= left + 8 && mousePos.x <= left + 8 + 16 &&
            mousePos.y >= top && mousePos.y <= top + 16) {
            this.__incrementSelectable = true;
        } else if (mousePos.x >= left + 8 && mousePos.x <= left + 8 + 16 &&
            mousePos.y >= top + 12 && mousePos.y <= top + 12 + 16) {
            this.__decrementSelectable = true;
        } else if (mousePos.x >= left + 8 && mousePos.x <= left + 8 + 16 &&
            mousePos.y >= top + 30 && mousePos.y <= top + 30 + 16) {
            this.__fillSelectable = true;
            this.__iconSelectable = true;
        } else if (mousePos.x >= left && mousePos.x <= left + width + 48 &&
            mousePos.y >= top && mousePos.y <= top + height + 48) {

            this.__editSelectable = true;

            return true;

        }

        return false;

    }

    action(editor, mousePos) {

        if (!this.environment.editors) {
            this.__incrementSelectable = false;
            this.__decrementSelectable = false;
            this.__fillSelectable = false;

            return;

        }

        var top = $(`#container_${this.__id}`)[0].offsetTop;
        var left = $(`#container_${this.__id}`)[0].offsetLeft;
        var width = $(`#container_${this.__id}`).width();
        var height = $(`#container_${this.__id}`).height();
        var size = parseInt($(`#html_${this.__id}`).css('font-size').replace("px", ""));

        if (mousePos.x >= left + 8 && mousePos.x <= left + 8 + 16 &&
            mousePos.y >= top && mousePos.y <= top + 16) {
            $(`#html_${this.__id}`).css('font-size', `${size + 2}px`);
            this.__incrementSelectable = true;
            this.edit();
            this.__editable = true;
        } else if (mousePos.x >= left + 8 && mousePos.x <= left + 8 + 16 &&
            mousePos.y >= top + 12 && mousePos.y <= top + 12 + 16 && size > 4) {
            $(`#html_${this.__id}`).css('font-size', `${size - 2}px`);
            this.__decrementSelectable = true;
            this.edit();
            this.__editable = true;
        } else if (mousePos.x >= left + 8 && mousePos.x <= left + 8 + 16 &&
            mousePos.y >= top + 30 && mousePos.y <= top + 30 + 16) {
            this.__fillSelectable = true;
            this.fill(editor);
        } else if (mousePos.x >= left && mousePos.x <= left + width + 48 &&
            mousePos.y >= top && mousePos.y <= top + height + 48) {
            this.edit();
            this.__editable = true;

            return true;

        }

        return false;

    }

    move(deltaX, deltaY) {
        var top = $(`#container_${this.__id}`)[0].offsetTop;
        var left = $(`#container_${this.__id}`)[0].offsetLeft;

        $(`#container_${this.__id}`).css('left', `${left + deltaX}px`);
        $(`#container_${this.__id}`).css('top', `${top + deltaY}px`);
    }

    reposition(deltaX, deltaY) {}

    position() {
        var top = $(`#container_${this.__id}`)[0].offsetTop;
        var left = $(`#container_${this.__id}`)[0].offsetLeft;

        var posX = Math.trunc(left / 32) * 32;
        var posY = Math.trunc(top / 32) * 32;

        var x = (left < posX - 16) ? posX - 32 : (left > posX + 16) ? posX + 32 : posX;
        var y = (top < posY - 16) ? posY - 32 : (top > posY + 16) ? posY + 32 : posY;

        $(`#container_${this.__id}`).css('left', `${x + 2}px`);
        $(`#container_${this.__id}`).css('top', `${y - 6}px`);

    }

    get serialize() {
        var top = $(`#container_${this.__id}`)[0].offsetTop;
        var left = $(`#container_${this.__id}`)[0].offsetLeft;
        var width = $(`#container_${this.__id}`).width();
        var height = $(`#container_${this.__id}`).height();
        var html = $(`#html_${this.__id}`).html();
        var fontSize = $(`#html_${this.__id}`).css('font-size');

        return {
            id: this.__id,
            type: this.__type,
            label: this.__label,
            html: html,
            fontSize: fontSize,
            center: {
                x: top,
                y: left
            }

        }

    }
    
}