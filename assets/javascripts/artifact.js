'use strict'

const DIRECTOR = 0;
const INHIBITOR = 1;

class Artifact {

    constructor(type, environment, images, id) {

        let guid = () => {
            let s4 = () => {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();

        }

        this.__images = images;
        this.__environment = environment;

        this.__frame = 'frame';

        this.__type = type;
        this.__label = "[no label]";

        this.__id = id == null ? guid() : id;

        this.__arcsSource = [];
        this.__arcsTarget = [];

        this.__selected = false;
        this.__selectable = false;

        this.__node = null;

        this.__center = {
            x: 0,
            y: 0
        }

        this.__joinable = true;

        this.__connector = {};

        this.__color = 'rgba(0,0,0,0.8);';

        this.__connector[DIRECTOR] = (function(__this) {

            return function(source, target, environment, images) {

                return new Director(source, target, environment, images);

            }

        })(this);

        this.__connector[INHIBITOR] = (function(__this) {

            return function(source, target, environment, images) {

                return new Inhibitor(source, target, environment, images);

            }

        })(this);

    }

    get connector() {
        return this.__connector;
    }

    get environment() {
        return this.__environment;
    }

    get images() {
        return this.__images;
    }

    get id() {
        return this.__id;
    }

    get label() {
        return this.__label;
    }

    set label(label) {
        this.__label = label;
    }

    get center() {
        return this.__center;
    }

    set centerX(x) {
        this.__center.x = x;
    }

    set centerY(y) {
        this.__center.y = y;
    }

    get type() {
        return this.__type;
    }

    get x() {
        return this.__center.x;
    }

    get y() {
        return this.__center.y;
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

    get targetArcs() {
        return this.__arcsTarget;
    }

    get sourceArcs() {
        return this.__arcsSource;
    }

    get type() {
        return this.__type;
    }

    get joinable() {
        return this.__joinable;
    }

    get color() {
        return this.__color;
    }

    set color(color) {
        this.__color = color;
    }

    get frame() {
        return this.frame;
    }

    set frame(frame) {
        this.__frame = frame;
    }

    get serializeArcs() {
        var sources = [];

        for (var iSource in this.__arcsSource) {
            var source = this.__arcsSource[iSource];

            sources.push(
                sources.push(source.json)
            );

        }

        return sources;

    }

    set node(node) {
        this.__node = node;
    }

    get node() {
        return this.__node;
    }

    equals(x, y) {

        return x > this.__center.x - 2 && x < this.__center.x + 2 &&
            y > this.__center.y - 2 && y < this.__center.y + 2;

    }

    intersects(x, y) {

        return x > this.__center.x - 16 && x < this.__center.x + 16 &&
            y > this.__center.y - 16 && y < this.__center.y + 16;

    }

    selectContained(rectangle) {

        for (var arc in this.__arcsSource) {
            let containsArc = false;

            for (let segment in this.__arcsSource[arc].segments) {

                if (this.__arcsSource[arc].segments[segment].contains(rectangle)) {
                    this.__arcsSource[arc].segments[segment].selected = true;
                }

            }

        }

        this.selected = this.contains(rectangle);

    }


    contains(rectangle) {

        return (rectangle.startX < this.__center.x - 16 &&
            rectangle.endX > this.__center.x + 16 &&
            rectangle.startY < this.__center.y - 16 &&
            rectangle.endY > this.__center.y + 16);


    }

    updateArcs() {

        for (var arc in this.__arcsSource) {
            this.environment.arcMap[this.__arcsSource[arc].id].target.text = this.label;
        }

        for (var arc in this.__arcsTarget) {
            this.environment.arcMap[this.__arcsTarget[arc].id].source.text = this.label;
        }

    }

    addSegment(point) {

        for (var arc in this.__arcsSource) {

            if (this.__arcsSource[arc].addSegment(point)) {
                return true;
            }

        }

        return false;

    }

    drawLabel(context) {
        function getTextWidth(text, font) {
            var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
            var context = canvas.getContext("2d");
            context.font = font;
            var metrics = context.measureText(text);
            return metrics.width;
        }

        let offset = getTextWidth(this.__label, "12px Arial");

        context.fillStyle = "rgba(0, 0, 0, 0.5)";
        context.font = "12px Arial";
        context.fillText(this.__label, this.__center.x - (offset / 2), this.__center.y + 32);

    }

    drawConnector(context, x, y) {

        context.beginPath();
        context.strokeStyle = "rgba(255, 0, 0, 0.5)";
        context.lineWidth = 1;
        context.moveTo(this.__center.x, this.__center.y);

        context.lineTo(x, y);
        context.stroke();

    }

    addTarget(type, target, arc) {
        this.__arcsTarget.push(arc);

        var icon = target.type == PLACE ? 'small-circle-square.png' : 'small-square-circle.png';
        var node = this.node.createChildNode(target.label, false, `assets/images/${icon}`, null, "context4");

        if (!(arc.id in this.environment.arcMap)) {
            this.environment.arcMap[arc.id] = {}
        }
        this.environment.arcMap[arc.id].target = node;
        this.environment.arcNodeMap[node.id] = arc;

        return arc;

    }

    addSource(type, source) {
        var arc = this.connector[type](source, this, this.environment, this.images);

        this.__arcsSource.push(arc);

        var icon = source.type == PLACE ? 'small-circle-square.png' : 'small-square-circle.png';

        var node = this.node.createChildNode(source.label, false, `assets/images/${icon}`, null, "context3");

        if (!(arc.id in this.environment.arcMap)) {
            this.environment.arcMap[arc.id] = {}
        }

        this.environment.arcMap[arc.id].source = node;

        this.environment.arcNodeMap[node.id] = arc;

        return arc;

    }

    move(deltaX, deltaY) {

        this.__center.x += deltaX;
        this.__center.y += deltaY;

    }

    reposition(deltaX, deltaY) {

        for (var arc in this.__arcsSource) {

            for (let segment in this.__arcsSource[arc].segments) {

                if (this.__arcsSource[arc].segments[segment].selected) {
                    this.__arcsSource[arc].segments[segment].move(deltaX, deltaY);
                }

            }

        }

    }

    reset(mousePos) {

        this.selected = this.actionable(mousePos);

        for (var arc in this.__arcsSource) {

            this.__arcsSource[arc].reset(mousePos);

            for (let segment in this.__arcsSource[arc].segments) {

                this.__arcsSource[arc].segments[segment].selected = false;

            }

        }

    }

    setSelection(mousePos) {

        this.selected = this.selected ? this.selected : this.actionable(mousePos);

    }

    adjust(point) {
        var posX = Math.trunc(point.x / 32) * 32;
        var posY = Math.trunc(point.y / 32) * 32;

        return {
            x: posX,
            y: posY
        }

    }

    setup(mousePos) {
        var posX = Math.trunc(mousePos.x / 32) * 32;
        var posY = Math.trunc(mousePos.y / 32) * 32;

        this.__center.x = (mousePos.x < posX - 16) ? posX - 32 : (mousePos.x > posX + 16) ? posX + 32 : posX;
        this.__center.y = (mousePos.y < posY - 16) ? posY - 32 : (mousePos.y > posY + 16) ? posY + 32 : posY;

    }

    position() {

        var posX = Math.trunc(this.__center.x / 32) * 32;
        var posY = Math.trunc(this.__center.y / 32) * 32;

        var centerX = (this.__center.x < posX - 16) ? posX - 32 : (this.__center.x > posX + 16) ? posX + 32 : posX;
        var centerY = (this.__center.y < posY - 16) ? posY - 32 : (this.__center.y > posY + 16) ? posY + 32 : posY;

        this.__center.x = centerX;
        this.__center.y = centerY;

    }

    positionSegments() {

        for (var arc in this.__arcsSource) {
            this.__arcsSource[arc].adjustSegments();
        }

    }

    drawSourceArcs(mode, context) {

        for (var source in this.__arcsSource) {

            this.__arcsSource[source].draw(mode, context);

        }

    }

    deleteArcs() {
        var filteredSource = this.__arcsSource.filter(function(value, index, arr) {

            return value.source.selected == false && value.target.selected == false;

        });

        this.__arcsSource = filteredSource;

        var filteredTarget = this.__arcsTarget.filter(function(value, index, arr) {

            return value.source.selected == false && value.target.selected == false;

        });

        this.__arcsTarget = filteredTarget;

        this.__arcsSource.forEach(function(value, index, arr) {

            value.deleteSegments();

        });

        this.__arcsTarget.forEach(function(value, index, arr) {

            value.deleteSegments();

        });

    }

    deleteSegments() {

        this.__arcsTarget.forEach(function(value, index, arr) {

            value.deleteSegments();

        });

        this.__arcsSource.forEach(function(value, index, arr) {

            value.deleteSegments();

        });

    }

    selectableArcs(point) {

        for (var arc in this.__arcsSource) {

            this.__arcsSource[arc].selectable = false;

            if (this.__arcsSource[arc].source.selectable || this.__arcsSource[arc].target.selectable) {
                continue;
            }

            if (this.__arcsSource[arc].selectSegments(point, 2)) {
                return;
            }

            this.__arcsSource[arc].selectable = (this.__arcsSource[arc].intersects(point, 2));

        }

    }

    selectOnIntersection(mousePos) {

        this.__selectable = (this.intersects(mousePos.x, mousePos.y));

        for (var arc in this.__arcsSource) {
            this.__arcsSource[arc].selectSegments(mousePos, 2);
        }

    }

    within(mousePos) {

        if (this.intersects(mousePos.x, mousePos.y)) {
            return true;
        }

    }

    deleteSelectedArcs() {
        var filteredSource = this.__arcsSource.filter(function(value, index, arr) {
            return value.selected == false;
        });

        this.__arcsSource = filteredSource;

        var filteredTarget = this.__arcsTarget.filter(function(value, index, arr) {
            return value.selected == false;
        });

    }

    getSegment(x, y) {

        for (var arc in this.__arcsSource) {
            var segment = this.__arcsSource[arc].getSegment(x, y);

            if (segment) {
                return segment;
            }

        }

        return segment;

    }

    getArc(point) {

        for (var arc in this.__arcsSource) {

            if (this.__arcsSource[arc].intersects(point, 2)) {

                return this.__arcsSource[arc];

            }

        }

        return null;

    }

    arcActionable(point) {

        for (var arc in this.__arcsSource) {
            this.__arcsSource[arc].actionable(point);
        }

    }

    arcAction(editor, point) {

        for (var arc in this.__arcsSource) {
            this.__arcsSource[arc].action(editor, point);
        }

    }

    action(editor, mousePos) {
        return false;
    }

    dblclick(editor, mousePos) {}

    colorSelectedArcs(color) {

        for (var arc in this.__arcsSource) {
            if (this.__arcsSource[arc].selected) {
                this.__arcsSource[arc].color = color;
            }

        }

    }

    fill(editor) {
        var node = document.createElement("div");
        var artifact = this;
        $(`#${this.__frame}`)[0].appendChild(node);

        node.setAttribute('style', `display:inline-block; position:absolute; ` +
            `left: ${this.__center.x - 12}px; ` +
            `top: ${this.__center.y - 30}px;` +
            `z-index: 2; padding:4px;"`);

        var picker = new Picker({
            parent: node,
            color: artifact.__color,
            onDone: function(color) {
                artifact.__editing = false;
                artifact.__color = color.rgbaString;
                editor.draw();

            },
            onClose: function(color) {
                $('#frame')[0].removeChild(node);
                artifact.__editing = false;
                editor.draw();
            }

        });

        this.__editing = true;

        picker.openHandler();

    }

    rename(editor) {
        var node = document.createElement("input");
        var artifact = this;

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

            artifact.label = node.value;
            artifact.updateArcs();

            editor.draw();

            editor.__treeMap[artifact.id].text = node.value;
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

}