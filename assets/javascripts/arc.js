'use strict'

class Arc {
    constructor(type, source, target, environment, images, id) {

        let guid = () => {
            let s4 = () => {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();

        }

        this.__id = id == null ? guid() : id;

        this.__type = type;

        this.__source = new Segment(source);
        this.__target = new Segment(target);

        this.__source_type = source.type;
        this.__target_type = target.type;

        this.__source_id = source.id;
        this.__target_id = target.id;

        this.__source_center = source.center;
        this.__target_center = target.center;

        this.__environment = environment;
        this.__images = images;

        this.__selected = false;
        this.__selectable = false;
        this.__segments = [];

        this.__incrementSelectable = false;
        this.__decrementSelectable = false;

        this.__editSelectable = false;
        this.__editing = false;

        this.__valveSelectable = false;
        this.__alterFlow = false;

        this.__tokens = 1;

        this.__color = 'rgba(0,0,0,1.0)';
        this.__frame = 'frame';

        this.__label = '';

        this.__labelPos = {
            x: 0,
            y: 0
        }

        this.__nodeMap = {};

        this.intersect = function(source, target, point, tolerate) {

            var distance = function(source, target) {
                var a = source.x - target.x;
                var b = source.y - target.y;

                return Math.sqrt(a * a + b * b);

            }

            var d1 = distance(source, target);
            var d2 = distance(source, point);
            var d3 = distance(target, point);

            return (Math.trunc(d2 + d3) >= Math.trunc(d1) - tolerate) &&
                (Math.trunc(d2 + d3) <= Math.trunc(d1) + tolerate);

        }

        this.getTextWidth = function(text, font) {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            context.font = font;
            var metrics = context.measureText(text);
            return metrics.width;
        }

        this.setStatus();

    }

    get id() {
        return this.__id;
    }

    get type() {
        return this.__type;
    }

    get environment() {
        return this.__environment;
    }

    get source() {
        return this.__source;
    }

    get target() {
        return this.__target;
    }

    set source(source) {
        this.__source = source;
    }

    set target(target) {
        this.__target = target;
    }

    get selected() {
        return this.__selected;
    }

    set selected(selected) {
        this.__selected = selected;
    }

    get selectable() {
        return this.__selectable;
    }

    set selectable(selectable) {
        this.__selectable = selectable;
    }

    get segments() {
        return this.__segments;
    }

    get label() {
        return this.__label;
    }

    set label(label) {
        this.__label = label;
    }

    set color(color) {
        this.__color = color;
    }
    set color(color) {
        this.__color = color;
    }

    get color() {
        return this.__color;
    }

    set color(color) {
        this.__color = color;
    }

    get sourceId() {
        return this.__source_id;
    }

    get targetId() {
        return this.__target_id;
    }

    get tokens() {
        return this.__tokens;
    }

    get nodeMap() {
        return this.__nodeMap;
    }

    reset(mousePos = null) {

        this.selected = mousePos ? this.actionable(mousePos) : false;

        return this.selected;

    }

    setStatus(status = false) {
        this.__incrementSelectable = status;
        this.__decrementSelectable = status;
        this.__fillSelectable = status;
        this.__renameSelectable = status;
    }

    incrementToken() {

        this.__tokens = this.__tokens + 1;

    }

    decrementToken() {

        this.__tokens = (this.__tokens == 0) ? 0 : this.__tokens - 1;

    }

    intersects(point, tolerate) {

        let source = this.__source;

        for (let segment in this.__segments) {
            let target = this.__segments[segment];

            if (this.intersect(source, target, point, tolerate)) {
                return true;
            }

            source = target;

        }

        let target = this.__target;

        return (this.intersect(source, target, point, tolerate));

    }

    lineOnRect(source, target, center) {
        function lineOnLine(x1, y1, x2, y2, x3, y3, x4, y4) {

            // calculate the direction of the lines

            let uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
            let uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));


            // if uA and uB are between 0-1, lines are colliding
            if (uA.toFixed(3) >= 0 && uA.toFixed(3) <= 1 && uB.toFixed(3) >= 0 && uB.toFixed(3) <= 1) {
                return {
                    x: x1 + (uA * (x2 - x1)),
                    y: y1 + (uA * (y2 - y1))
                }

            }

            return null;

        }

        var rect = {
            l: center.x - 16,
            r: center.x + 16,
            t: center.y - 16,
            b: center.y + 16
        }

        let left = lineOnLine(source.x, source.y, target.x, target.y, rect.l, rect.t, rect.l, rect.b);

        if (left) {
            return left;
        }

        let right = lineOnLine(source.x, source.y, target.x, target.y, rect.r, rect.t, rect.r, rect.b);

        if (right) {
            return right;
        }

        let top = lineOnLine(source.x, source.y, target.x, target.y, rect.l, rect.t, rect.r, rect.t);

        if (top) {
            return top;
        }

        let bottom = lineOnLine(source.x, source.y, target.x, target.y, rect.l, rect.b, rect.r, rect.b);

        if (bottom) {
            return bottom;
        }

        return null;

    }

    adjustSegment(point) {
        var posX = Math.trunc(point.x / 32) * 32;
        var posY = Math.trunc(point.y / 32) * 32;

        if (posX - point.x > 16) {
            posX = posX - 32;
        }

        if (point.y - posY > 16) {
            posY = posY + 32;
        }

        if (point.x - posX > 16) {
            posX = posX + 32;
        }

        return {
            x: posX,
            y: posY
        }

    }

    addSegment(point) {
        var segmentAdded = false;

        var nearest = function(p, a, b) {
            var atob = { x: b.x - a.x, y: b.y - a.y };
            var atop = { x: p.x - a.x, y: p.y - a.y };
            var len = atob.x * atob.x + atob.y * atob.y;
            var dot = atop.x * atob.x + atop.y * atob.y;
            var t = Math.min(1, Math.max(0, dot / len));

            dot = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);

            return {
                x: (a.x + atob.x * t),
                y: (a.y + atob.y * t)
            }

        }

        let source = this.__source;
        var segments = [];

        for (let segment in this.__segments) {
            let target = this.__segments[segment];

            if (!segmentAdded && this.intersect(source, target, point, 2)) {
                let coordinate = this.adjustSegment(nearest(point, source, point));
                let segment = new Segment(coordinate)

                segment.selected = true;

                segments.push(segment);
                segments.push(target)
                segmentAdded = true;

            } else {
                segments.push(target)
            }

            source = target;

        }

        let target = this.__target;

        if (!segmentAdded && this.intersect(source, target, point, 2)) {
            let coordinate = this.adjustSegment(nearest(point, source, point));
            let segment = new Segment(coordinate)

            segment.selected = true;

            segments.push(segment);
            segmentAdded = true;

        }

        this.__segments = segments;

        return segmentAdded;

    }

    adjustSegments() {

        for (let segment in this.__segments) {

            if (this.__segments[segment].selected) {
                var point = this.adjustSegment(this.__segments[segment].point)

                this.__segments[segment].x = point.x;
                this.__segments[segment].y = point.y;

            }

        }

    }

    draw(context) {

        var line = function drawLine(context, selected, selectable, sourceX, sourceY, targetX, targetY) {
            context.beginPath();

            if (selectable) {
                context.setLineDash([2, 1]);
                context.strokeStyle = "rgba(0, 0, 255, 0.5)";
            } else if (selected) {
                context.strokeStyle = "rgba(0, 0, 255, 0.5)";
            } else {
                context.setLineDash([1, 0]);
                context.strokeStyle = "rgba(0, 0, 0, 0.5)";
            }

            context.lineWidth = 1;
            context.moveTo(sourceX, sourceY);
            context.lineTo(targetX, targetY);
            context.stroke();
        }

        var adjust = (this.__source_type == 1);

        var source = {
            x: this.__source.x,
            y: this.__source.y
        }

        var target = {
            x: this.__target.x,
            y: this.__target.y
        }

        var point = target;

        if (this.__segments.length > 0) {
            point = this.__segments[0];
        }

        var aDir = Math.atan2(this.__source.x - point.x, this.__source.y - point.y);

        if (this.__source.type == 1) {
            source.x = this.__source.x - ((this.__source.x - (this.__source.x - this.xCor(18, aDir))) * 0.2);
            source.y = this.__source.y - ((this.__source.y - (this.__source.y - this.yCor(18, aDir))) * 0.2);
        }

        var sourceX = source.x - this.xCor(16, aDir);
        var sourceY = source.y - this.yCor(16, aDir);

        for (let segment in this.__segments) {
            let targetX = this.__segments[segment].point.x;
            let targetY = this.__segments[segment].point.y;

            if (adjust) {
                var point = this.lineOnRect({
                        x: source.x,
                        y: source.y
                    }, {
                        x: targetX,
                        y: targetY
                    },
                    this.__source_center);

                if (point) {
                    sourceX = point.x;
                    sourceY = point.y;
                }

                adjust = false;

            }

            line(context, this.__selected, this.__selectable, sourceX, sourceY, targetX, targetY);

            if (this.environment.decorate) {
                context.strokeStyle = "#ff0000";
                context.beginPath();

                context.arc(targetX, targetY, 5, 0, 2 * Math.PI);

                context.stroke();
            }

            if (this.__segments[segment].selected) {
                context.fillStyle = "rgba(0, 0, 255, 0.1)";
                context.fill();
            }

            if (this.__segments[segment].selectable) {
                context.beginPath();
                context.strokeStyle = "rgba(0, 0, 255, 0.4)";

                context.lineWidth = 2;
                context.setLineDash([1, 1]);

                context.rect(targetX - 6, targetY - 6, 12, 12);
                context.stroke();

            }

            sourceX = targetX;
            sourceY = targetY;

        }

        aDir = Math.atan2(sourceX - this.__target.x, this.__target.y - sourceY);

        let xPos = 16;
        let yPos = 16;

        let deltaX = target.x - sourceX;
        let deltaY = target.y - sourceY;

        let radians = parseFloat(Math.atan2(deltaY, deltaX).toFixed(2));

        if (radians >= 0.50 && radians <= 2.50) {
            yPos = -16;
        }

        if (radians >= -2.5 && radians <= -0.5) {
            yPos = -16;
        }

        let targetX = target.x;
        let targetY = target.y;

        if (this.__target_type == 1) {

            var point = this.lineOnRect({
                    x: sourceX,
                    y: sourceY
                }, {
                    x: targetX,
                    y: targetY
                },
                this.__target_center);

            if (point) {
                targetX = point.x;
                targetY = point.y;
            }

        } else if (this.__target_type == 0) {
            targetX = target.x + this.xCor(xPos, aDir);
            targetY = target.y + this.yCor(yPos, aDir)
        }

        if (adjust) {
            var point = this.lineOnRect({
                    x: sourceX,
                    y: sourceY
                }, {
                    x: targetX,
                    y: targetY
                },
                this.__source_center);

            if (point) {
                sourceX = point.x;
                sourceY = point.y;
            }

        }

        line(context, this.__selected, this.__selectable, sourceX, sourceY, targetX, targetY);

        this.drawArrow(context, sourceX, sourceY, targetX, targetY);
        this.drawDecorators(context, sourceX, sourceY, targetX, targetY);

    }

    yCor(len, dir) {
        return (len * Math.cos(dir));
    }

    xCor(len, dir) {
        return (len * Math.sin(dir));
    }

    drawTokenConsumption(context, x, y) {
        function getComposite(bgColor, lightColor, darkColor) {
            var rgba = bgColor.substring(5, bgColor.length - 1).replace(/ /g, '').split(',')

            var uicolors = [rgba[0] / 255, rgba[1] / 255, rgba[2] / 255];
            var c = uicolors.map((col) => {
                if (col <= 0.03928) {
                    return col / 12.92;
                }
                return Math.pow((col + 0.055) / 1.055, 2.4);
            });

            var l = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);

            return (l > 0.179) ? darkColor : lightColor;

        }

        let count = `${this.__tokens}`;
        let offset = this.getTextWidth(count, "14px Arial");

        context.fillStyle = this.__color;
        context.fillRect(x - offset - 10, y - 16, offset + 8, 22);

        context.fillStyle = getComposite(this.__color, "rgba(255, 255, 255, 1.0)", "rgba(0, 0, 0, 1.0)");
        context.font = "14px Arial";
        context.fillText(count, x - offset - 6, y);
        context.stroke();

        this.__labelPos.x = x;
        this.__labelPos.y = y;

    }

    drawLabel(context, x, y) {

        function getTextWidth(text, font) {
            var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
            var context = canvas.getContext("2d");
            context.font = font;
            var metrics = context.measureText(text);
            return metrics.width;
        }

        if (this.__label != "") {
            let offset = getTextWidth(this.__label, "12px Arial");

            context.fillStyle = "rgba(0, 0, 0, 0.5)";
            context.font = "12px Arial";
            context.fillText(this.__label, x - (offset / 2) - 8, y + 24);

        }

    }

    drawDecorators(context, xCenter, yCenter, x, y) {
        var aDir = Math.atan2(xCenter - x, yCenter - y);
        var iY = aDir > 0 ? 14 : 28;
        var xMid = (xCenter + x) / 2;
        var yMid = (yCenter + y) / 2;


        context.globalAlpha = 1.0;
        this.drawTokenConsumption(context, xMid + 10, yMid + this.yCor(18, aDir + 0.5) + iY - (aDir > 0 ? 0 : 32));
        this.drawLabel(context, xMid + 10, yMid + this.yCor(18, aDir + 0.5) + iY - (aDir > 0 ? 0 : 32));

        context.globalAlpha = 1.0;

        let textWidth = this.getTextWidth(`${this.__tokens}`, "16px Arial");

        if (this.environment.decorate && this.environment.editors && this.selected) {

            if (this.__incrementSelectable) {
                context.globalAlpha = 1.0;
            } else {
                context.globalAlpha = 0.6;
            }

            context.drawImage(this.__images[1], xMid + 12, yMid + this.yCor(18, aDir + 0.5) + iY - (aDir > 0 ? 0 : 32), 16, 16);
            context.stroke();

            if (this.__decrementSelectable) {
                context.globalAlpha = 1.0;
            } else {
                context.globalAlpha = 0.6;
            }

            context.drawImage(this.__images[0], xMid + 12, yMid + this.yCor(18, aDir + 0.5) - iY, 16, 16);
            context.stroke();

            if (this.__renameSelectable) {
                context.globalAlpha = 1.0;
            } else {
                context.globalAlpha = 0.6;
            }

            context.drawImage(this.__images[3], xMid - 22 - textWidth, yMid + this.yCor(18, aDir + 0.5) + iY - (aDir > 0 ? 0 : 32), 16, 16);
            context.stroke();

            if (this.__fillSelectable) {
                context.globalAlpha = 1.0;
            } else {
                context.globalAlpha = 0.6;
            }

            context.drawImage(this.__images[2], xMid - 22 - textWidth, yMid + this.yCor(18, aDir + 0.5) - iY, 16, 16);
            context.stroke();

        }

    }

    selectSegments(point, tolerate) {
        let result = false;

        for (let segment in this.__segments) {
            let position = this.__segments[segment].point;

            if ((Math.abs(point.x - 2 - position.x) < 4) && (Math.abs(point.y - 2 - position.y) < 4)) {
                this.__segments[segment].selectable = true;
                result = true;
            } else {
                this.__segments[segment].selectable = false;

            }

        }

        return result;

    }

    deleteSegments() {

        var filtered = this.__segments.filter(function(value, index, arr) {

            return value.selected == false;

        });

        this.__segments = filtered;

    }

    getSegment(x, y) {

        for (let segment in this.__segments) {
            let position = this.__segments[segment].point;

            if ((Math.abs(x - 2 - position.x) < 4) && (Math.abs(y - 2 - position.y) < 4)) {
                return this.__segments[segment];
            }

        }

        return null;

    }

    actionable(mousePos) {

        if (!this.environment.editors || !this.selected) {
            this.setStatus(false);
            return;

        }

        let textWidth = this.getTextWidth(`${this.__tokens}`, "16px Arial");
        let x = mousePos.x;
        let y = mousePos.y;


        var source = this.__source;

        if (this.__segments.length > 0) {

            source = this.__segments[this.__segments.length - 1];

        }

        var aDir = Math.atan2(source.x - this.__target.x, source.y - this.__target.y);

        var xMid = (source.x + this.__target.x) / 2;
        var yMid = (source.y + this.__target.y) / 2;
        var iY = aDir > 0 ? 14 : 28;

        this.setStatus(false);

        if (x > xMid + 10 &&
            x < xMid + 10 + 16 &&
            y > yMid + this.yCor(18, aDir + 0.5) + iY - (aDir > 0 ? 0 : 32) &&
            y < yMid + this.yCor(18, aDir + 0.5) + iY - (aDir > 0 ? 0 : 32) + 16) {
            this.__incrementSelectable = true;
            return true;
        } else if (x > xMid + 10 &&
            x < xMid + 10 + 16 &&
            y > yMid + this.yCor(18, aDir + 0.5) - iY &&
            y < yMid + this.yCor(18, aDir + 0.5) - iY + 16) {
            this.__decrementSelectable = true;
            return true;

        } else if (x > xMid - 22 - textWidth &&
            x < xMid - 22 - textWidth + 16 &&
            y > yMid + this.yCor(18, aDir + 0.5) + iY - (aDir > 0 ? 0 : 32) &&
            y < yMid + this.yCor(18, aDir + 0.5) + iY - (aDir > 0 ? 0 : 32) + 16) {
            this.__renameSelectable = true;
            return true;

        } else if (x > xMid - 22 - textWidth &&
            x < xMid - 22 - textWidth + 16 &&
            y > yMid + this.yCor(18, aDir + 0.5) - iY &&
            y < yMid + this.yCor(18, aDir + 0.5) - iY + 16) {
            this.__fillSelectable = true;
            return true;

        }

        return false;

    }

    action(editor, mousePos) {
        let textWidth = this.getTextWidth(`${this.__tokens}`, "16px Arial");
        let x = mousePos.x;
        let y = mousePos.y;
        var source = this.__source;

        if (this.__segments.length > 0) {

            source = this.__segments[this.__segments.length - 1];

        }

        var aDir = Math.atan2(source.x - this.__target.x, source.y - this.__target.y);
        var xMid = (source.x + this.__target.x) / 2;
        var yMid = (source.y + this.__target.y) / 2;
        var iY = aDir > 0 ? 14 : 28;

        if (x > xMid + 10 &&
            x < xMid + 10 + 16 &&
            y > yMid + this.yCor(18, aDir + 0.5) + iY - (aDir > 0 ? 0 : 32) &&
            y < yMid + this.yCor(18, aDir + 0.5) + iY - (aDir > 0 ? 0 : 32) + 16) {
            this.__tokens = this.__tokens == 1 ? 1 : this.__tokens - 1;
        } else if (x > xMid - 22 - textWidth &&
            x < xMid - 22 - textWidth + 16 &&
            y > yMid + this.yCor(18, aDir + 0.5) + iY - (aDir > 0 ? 0 : 32) &&
            y < yMid + this.yCor(18, aDir + 0.5) + iY - (aDir > 0 ? 0 : 32) + 16) {
            this.rename(editor, xMid - 80, yMid + this.yCor(18, aDir + 0.5) + iY - (aDir > 0 ? 0 : 32))
        } else if (x > xMid + 10 &&
            x < xMid + 10 + 16 &&
            y > yMid + this.yCor(18, aDir + 0.5) - iY &&
            y < yMid + this.yCor(18, aDir + 0.5) - iY + 16) {
            this.__tokens = this.__tokens + 1;
        } else if (x > xMid - 22 - textWidth &&
            x < xMid - 22 - textWidth + 16 &&
            y > yMid + this.yCor(18, aDir + 0.5) - iY &&
            y < yMid + this.yCor(18, aDir + 0.5) - iY + 16) {

            this.fill(editor);

        }

    }

    get json() {
        var segments = [];

        for (var iSegment in this.__segments) {

            segments.push({
                x: this.__segments[iSegment].x,
                y: this.__segments[iSegment].y
            });

        }

        return {
            source: this.__source_id,
            target: this.__target_id,
            usage: this.__type == 1 ? "inhibit" : "flow",
            tokens: this.__tokens,
            segments: segments
        }

    }

    fill(editor) {
        var node = document.createElement("div");
        var arc = this;

        $(`#${this.__frame}`)[0].appendChild(node);

        node.setAttribute('style', `display:inline-block; position:absolute; ` +
            `left: ${this.__labelPos.x - 12}px; ` +
            `top: ${this.__labelPos.y - 30}px;` +
            `z-index: 2; padding:4px;"`);

        var picker = new Picker({
            parent: node,
            color: arc.__color,
            onDone: function(color) {
                arc.__color = color.rgbaString;
                editor.draw();

            },
            onClose: function(color) {
                $('#frame')[0].removeChild(node);
                arc.__editing = false;
                editor.draw();
            }

        });

        picker.openHandler();

    }

    rename(editor, x, y) {
        var node = document.createElement("input");
        var arc = this;

        node.setAttribute("type", "text");
        node.value = this.label;

        $(`#${this.__frame}`)[0].appendChild(node);

        node.setAttribute('style', `display:inline-block; position:absolute; ` +
            `left: ${x}px; ` +
            `top: ${y}px;` +
            `width: 100px;` +
            `z-index: 2; padding:4px;` +
            `border:1px solid rgba(0,0,0,0.4);` +
            `background-color:rgba(255,255,255,1.0);"`);

        node.focus();

        node.addEventListener("blur", function() {

            arc.label = node.value;

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

}