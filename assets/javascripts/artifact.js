'use strict'

const DIRECTOR = 0;
const INHIBITOR = 1;

class Artifact extends Component {

    constructor(type, environment, images, id) {
        super(id)

        this.__images = images;
        this.__environment = environment;

        this.__frame = 'frame';

        this.__type = type;
        this.__label = "[no label]";

        this.__arcsSource = [];
        this.__arcsTarget = [];

        this.__showMenu = true;

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

        this.__menu = [-1, -1, -1, -1, -1, -1, -1];

    }

    getMenu() {
        return this.__menu;
    }

    setMenu(menu) {
        this.__menu = menu;
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

    set showMenu(showMenu) {
        this.__showMenu = showMenu;
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
            let containsArc = true;

            for (let segment in this.__arcsSource[arc].segments) {

                if (this.__arcsSource[arc].segments[segment].contains(rectangle)) {
                    this.__arcsSource[arc].segments[segment].selected = true;
                } else {
                    containsArc = false;
                }

            }

            this.__arcsSource[arc].selected = containsArc ?
                (this.__arcsSource[arc].source.contains(rectangle) && this.__arcsSource[arc].target.contains(rectangle)) : false;


        }

        this.selected = this.contains(rectangle);

        return this.selected;

    }

    setStatus(status = false) {
        this.__incrementSelectable = status;
        this.__decrementSelectable = status;
        this.__fillSelectable = status;
        this.__renameSelectable = status;
        this.__increaseSelectable = status;
        this.__decreaseSelectable = status;
        this.__measureSelectable = status;
        this.__iconSelectable = status;

    }

    isActionable(mousePos) {
        let x = mousePos.x;
        let y = mousePos.y;

        if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            return true;
        } else if (x > this.__center.x + 18 && x < this.__center.x + 34 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.__decrementSelectable = true;
            return true;
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y - 20 && y < this.__center.y - 4) {
            this.__fillSelectable = true;
            this.__iconSelectable = true;
            return true;
        } else if (x > this.__center.x - 36 && x < this.__center.x - 24 &&
            y > this.__center.y + 4 && y < this.__center.y + 24) {
            this.__renameSelectable = true;
            return true;
        }

        return false;

    }

    showArcMenu(showMenu) {

        for (var arc in this.__arcsSource) {

            if (this.__arcsSource[arc].selected) {
                this.__arcsSource[arc].showMenu = false;
            }

        }

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
        let offset = this.getTextWidth(this.__label, "12px Arial");

        context.fillStyle = "rgba(0, 0, 0, 0.5)";
        context.font = "12px Arial";
        context.fillText(this.__label, this.__center.x - (offset / 2), this.__center.y + 32);

    }

    drawConnector(context, x, y) {

        context.beginPath();
        context.strokeStyle = (this.__environment.connector == 0) ? "rgba(0, 0, 255, 0.5)" : "rgba(255, 0, 0, 0.5)";
        context.lineWidth = 1;
        context.moveTo(this.__center.x, this.__center.y);

        context.lineTo(x, y);
        context.stroke();

    }

    drawMenu(context) {

        if (this.__showMenu && this.environment.editors && this.selected) {

            if (this.getMenu()[0] == 1) {
                if (this.__incrementSelectable) {
                    context.globalAlpha = 1.0;
                } else {
                    context.globalAlpha = 0.6;
                }

                context.drawImage(this.__images[0], this.__center.x + 18, this.__center.y - 20);

            }

            if (this.getMenu()[1] == 1) {
                if (this.__decrementSelectable) {
                    context.globalAlpha = 1.0;
                } else {
                    context.globalAlpha = 0.6;
                }

                context.drawImage(this.__images[1], this.__center.x + 18, this.__center.y + 4);

            }

            if (this.getMenu()[2] == 1) {
                if (this.__fillSelectable) {
                    context.globalAlpha = 1.0;
                } else {
                    context.globalAlpha = 0.6;
                }

                context.drawImage(this.__images[2], this.__center.x - 36, this.__center.y - 22);

            }

            if (this.getMenu()[3] == 1) {
                if (this.__renameSelectable) {
                    context.globalAlpha = 1.0;
                } else {
                    context.globalAlpha = 0.6;
                }

                context.drawImage(this.__images[3], this.__center.x - 36, this.__center.y + 4);
            }

            if (this.getMenu()[4] == 1) {
                if (this.__increaseSelectable) {
                    context.globalAlpha = 1.0;
                } else {
                    context.globalAlpha = 0.6;
                }

                context.drawImage(this.__images[4], this.__center.x + 22, this.__center.y - 20);
            }

            if (this.getMenu()[5] == 1) {
                if (this.__decreaseSelectable) {
                    context.globalAlpha = 1.0;
                } else {
                    context.globalAlpha = 0.6;
                }

                context.drawImage(this.__images[5], this.__center.x + 22, this.__center.y + 4);
            }


            if (this.getMenu()[6] == 1) {
                if (this.__measureSelectable) {
                    context.globalAlpha = 1.0;
                } else {
                    context.globalAlpha = 0.6;
                }

                context.drawImage(this.__images[6], this.__center.x - 36, this.__center.y - 22);

            }

            if (this.getMenu()[7] == 1) {
                if (this.__iconSelectable) {
                    context.globalAlpha = 1.0;
                } else {
                    context.globalAlpha = 0.6;
                }

                context.drawImage(this.__images[7], this.__center.x - 36, this.__center.y - 22);

            }

        }

    }

    addTarget(type, target, arc) {
        this.__arcsTarget.push(arc);

        var icon = target.type != PLACE ? 'small-circle-square.png' : 'small-square-circle.png';
        var node = this.node.createChildNode(target.label, false, `assets/images/${icon}`, null, "context4");

        arc.updateNodeMap(node);

        this.environment.arcMap[arc.id].target = node;
        this.environment.arcNodeMap[node.id] = arc;

        return arc;

    }

    addSource(type, source) {
        var arc = this.connector[type](source, this, this.environment, this.images);

        this.__arcsSource.push(arc);

        var icon = source.type == PLACE ? 'small-circle-square.png' : 'small-square-circle.png';

        var node = this.node.createChildNode(source.label, false, `assets/images/${icon}`, null, "context3");

        arc.updateNodeMap(node);

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

    reset(mousePos = null) {

        this.selected = mousePos ? this.actionable(mousePos) : false;

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

        this.__arcsSource.forEach(function(value, index, arr) {
            var nodes = value.deleteReferences();

            nodes[0].removeNode();
            nodes[1].removeNode();

        });

        this.__arcsTarget.forEach(function(value, index, arr) {
            var nodes = value.deleteReferences();

            nodes[0].removeNode();
            nodes[1].removeNode();

        });

    }

    removeArc(arc) {

        var filteredTarget = this.__arcsTarget.filter(function(value, index, arr) {

            return value.id != this.id;

        }, arc);

        this.__arcsTarget = filteredTarget;

        var filteredSource = this.__arcsSource.filter(function(value, index, arr) {

            return value.id != this.id;

        }, arc);

        this.__arcsSource = filteredSource;

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
        var node = document.createElement("input");

        node.setAttribute("type", "color");
        node.setAttribute('style', `display:inline-block; position:absolute; ` +
            `left: ${this.__center.x - 12}px; ` +
            `top: ${this.__center.y - 30}px;` +
            `width: 10px;` +
            `opacity:0`);

        node.value = this.__color;

        var artifact = this;

        $(`#${this.__frame}`)[0].appendChild(node);

        window.setTimeout(function() {
            node.click();
        }, 100);

        node.addEventListener("change", function() {
            window.setTimeout(function() {
                artifact.__color = node.value;
                artifact.__selected = true;
                editor.draw();
            }, 100);

        });

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