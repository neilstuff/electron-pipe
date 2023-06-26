const PLACE = 0;
const TRANSITION = 1;
const CONTAINER = 2;

const PROCESS = 3;
const EVENT = 4;

class Editor extends Engine {

    constructor(frame, canvas, placeholder, images, environment) {
        super(frame, canvas, images, environment);

        this.__placeholder = placeholder;
        this.__environment = environment;

        this.__position = null;
        this.__segments = [];

        this.__place_counter = 1;
        this.__transition_counter = 1;
        this.__container_counter = 1;

        this.__drawConnector = false;
        this.__moveArtifacts = false;
        this.__shiftDown = false;
        this.__selection = null;
        this.__source = null;
        this.__point = false;
        this.__dimension = {};
        this.__origin = null;

        this.__nodeMap = {};
        this.__treeMap = {};

        let editor = this;

        this.__CALLBACKS = {

            onclick: function(node) {
                editor.reset();

                if (editor.__nodeMap[node.id] != null) {
                    editor.__nodeMap[node.id].selected = true;
                }
                editor.draw();
            },

            addchild: function(node) {},

            removechild: function(node) {},

            editnode: function(node) {
                editor.__nodeMap[node.id].label = node.text;

                editor.__nodeMap[node.id].updateArcs();

                editor.draw();

                editor.__tree.drawTree();

            },

            oncontextmenu: function(node) {
                return editor.environment.mode == 0;
            }

        }

        this.__TREE_MENU = {
            'context1': {
                elements: [{
                        text: 'Rename Place',
                        icon: 'assets/images/rename-icon.png',
                        action: function(node) {
                            node.editNode();
                        }

                    },
                    {
                        text: 'Delete Place',
                        icon: 'assets/images/bin-icon.png',
                        action: function(node) {
                            node.removeNode();
                        }

                    },
                    {
                        text: 'Token Actions',
                        icon: 'assets/images/token-icon.png',
                        action: function(node) {},
                        submenu: {
                            elements: [{
                                    text: 'Plus',
                                    icon: 'assets/images/plus.png',
                                    action: function(node) {
                                        editor.__nodeMap[node.id].incrementToken();
                                        editor.draw();
                                    }
                                },
                                {
                                    text: 'Minus',
                                    icon: 'assets/images/minus.png',
                                    action: function(node) {
                                        editor.__nodeMap[node.id].decrementToken();
                                        editor.draw();
                                    }

                                }

                            ]

                        }

                    }

                ]

            },
            'context2': {
                elements: [{
                        text: 'Rename Transition',
                        icon: 'assets/images/rename-icon.png',
                        action: function(node) {
                            node.editNode();
                        }

                    },
                    {
                        text: 'Delete Transition',
                        icon: 'assets/images/bin-icon.png',
                        action: function(node) {
                            node.removeNode();
                        }

                    }

                ]

            },
            'context3': {
                elements: [{
                        text: 'Delete Arc',
                        icon: 'assets/images/bin-icon.png',
                        action: function(node) {
                            node.removeNode();
                        }

                    },
                    {
                        text: 'Token Actions',
                        icon: 'assets/images/token-icon.png',
                        action: function(node) {},
                        submenu: {
                            elements: [{
                                    text: 'Plus',
                                    icon: 'assets/images/plus.png',
                                    action: function(node) {
                                        editor.environment.arcNodeMap[node.id].incrementToken();
                                        editor.draw();
                                    }
                                },
                                {
                                    text: 'Minus',
                                    icon: 'assets/images/minus.png',
                                    action: function(node) {
                                        editor.environment.arcNodeMap[node.id].decrementToken();
                                        editor.draw();
                                    }

                                }

                            ]

                        }

                    }

                ]

            },
            'context4': {
                elements: [{
                        text: 'Delete Arc',
                        icon: 'assets/images/bin-icon.png',
                        action: function(node) {
                            node.removeNode();
                        }

                    },
                    {
                        text: 'Token Actions',
                        icon: 'assets/images/token-icon.png',
                        action: function(node) {},
                        submenu: {
                            elements: [{
                                    text: 'Plus',
                                    icon: 'assets/images/plus.png',
                                    action: function(node) {
                                        editor.environment.arcNodeMap[node.id].incrementToken();
                                        editor.draw();
                                    }
                                },
                                {
                                    text: 'Minus',
                                    icon: 'assets/images/minus.png',
                                    action: function(node) {
                                        editor.environment.arcNodeMap[node.id].decrementToken();
                                        editor.draw();
                                    }

                                }

                            ]

                        }

                    }

                ]

            }

        }

        this.__tree = createTree(placeholder, 'white', this.__TREE_MENU, this.__CALLBACKS);

        this.__root = this.__tree.createNode('Artifacts', false, 'assets/images/folder-icon.png', null, null, null);
        this.__placeFolder = this.__root.createChildNode('Places', false, 'assets/images/folder-icon.png', null, null);
        this.__transitionFolder = this.__root.createChildNode('Transitions', false, 'assets/images/folder-icon.png', null, null);

        this.__tree.drawTree();

        this.__creator = {};

        this.__creator[PLACE] = (function(__this) {

            return function(mousePos, id = null, label = null) {
                var place = new Place(__this.__environment, __this.__images, id);

                place.setup(mousePos);
                place.selected = true;

                place.label = (label == null) ?
                    __this.getLabel("P", __this.__place_counter, function(counter) {
                        __this.__place_counter = __this.__place_counter + 1;
                        return __this.__place_counter;
                    }) : label;

                __this.environment.artifacts.push(place);
                __this.environment.artifactMap[place.id] = place;

                var node = __this.__placeFolder.createChildNode(place.label, false, 'assets/images/circle.png', null, 'context1');

                place.node = node;

                __this.__nodeMap[node.id] = place;
                __this.__treeMap[place.id] = node;

                __this.__moveArtifacts = true;

                return place;

            };

        })(this);

        this.__creator[EVENT] = (function(__this) {

            return function(mousePos, id = null, label = null) {
                var transition = new Event(__this.__environment, __this.__images, id);

                transition.setup(mousePos);
                transition.selected = true;

                transition.label = (label == null) ?
                    __this.getLabel("T", __this.__transition_counter, function(counter) {
                        __this.__transition_counter = __this.__transition_counter + 1;
                        return __this.__transition_counter;
                    }) : label;

                __this.environment.artifacts.push(transition);
                __this.environment.artifactMap[transition.id] = transition;

                var node = __this.__transitionFolder.createChildNode(transition.label, false, 'assets/images/square.png', null, "context2");

                transition.node = node;

                __this.__nodeMap[node.id] = transition;
                __this.__treeMap[transition.id] = node;

                __this.__moveArtifacts = true;

                return transition;

            };

        })(this);

        this.__creator[PROCESS] = (function(__this) {

            return function(mousePos, id = null, label = null) {
                var transition = new Process(__this.__environment, __this.__images, id);

                transition.setup(mousePos);
                transition.selected = true;

                transition.label = (label == null) ?
                    __this.getLabel("T", __this.__transition_counter, function(counter) {
                        __this.__transition_counter = __this.__transition_counter + 1;
                        return __this.__transition_counter;
                    }) : label;

                __this.environment.artifacts.push(transition);
                __this.environment.artifactMap[transition.id] = transition;

                var node = __this.__transitionFolder.createChildNode(transition.label, false, 'assets/images/square.png', null, "context2");

                transition.node = node;

                __this.__nodeMap[node.id] = transition;
                __this.__treeMap[transition.id] = node;

                __this.__moveArtifacts = true;

                return transition;

            };

        })(this);
        this.__creator[CONTAINER] = (function(__this) {

            return function(mousePos, id = null, label = null) {
                var container = new Container(__this.__environment, __this.__images, id);

                container.setup(mousePos);
                container.create();

                container.selected = true;

                container.label = (label == null) ?
                    __this.getLabel("C", __this.__container_counter, function(counter) {
                        __this.__container_counter = __this__container_counter + 1;
                        return __this.__container_counter;
                    }) : label;

                container.label = (label == null) ? `C-${__this.__container_counter}` : label;
                __this.__container_counter = __this.__container_counter + 1

                __this.environment.artifacts.push(container);
                __this.environment.artifactMap[container.id] = container;

                __this.__moveArtifacts = true;

                return container;

            };

        })(this);

    }

    get selection() {
        return this.__selection;
    }

    get creators() {
        return this.__creator;
    }
    get moveArtifacts() {
        return this.__moveArtifacts;
    }

    set moveArtifacts(moveArtifacts) {
        this.__moveArtifacts = moveArtifacts;
    }

    clear() {

        this.__selection = null;
        this.__moveArtifacts = false;
        this.__drawConnector = false;

        for (var iArtifact in this.artifacts) {

            if ('destroy' in this.artifacts[iArtifact]) {
                this.artifacts[iArtifact].destroy();
            }

        }

        this.__position = null;
        this.__environment.artifacts.splice(0, this.__environment.artifacts.length);
        this.__segments = [];

        this.__place_counter = 1;
        this.__transition_counter = 1;
        this.__container_counter = 1;

        for (var prop in this.__environment.artifactMap) {
            if (this.__environment.artifactMap.hasOwnProperty(prop)) {
                delete this.__environment.artifactMap[prop];
            }
        }

        this.__nodeMap = {};
        this.__treeMap = {};

        this.__tree = createTree(this.__placeholder, 'white', this.__TREE_MENU, this.__CALLBACKS);

        this.__root = this.__tree.createNode('Artifacts', false, 'assets/images/folder-icon.png', null, null, null);
        this.__placeFolder = this.__root.createChildNode('Places', false, 'assets/images/folder-icon.png', null, null);
        this.__transitionFolder = this.__root.createChildNode('Transitions', false, 'assets/images/folder-icon.png', null, null);

        this.__tree.drawTree();

    }

    leave(id) {
        this.artifactMap[id].show();
    }

    redraw(id) {
        this.__se
        this.artifactMap[id].redraw(this.__canvas.getContext('2d'));
    }

    focus() {
        var click = function(node) {
            var event = new MouseEvent("click");
            node.dispatchEvent(event);
        }

        click(canvas);

    }

    getLabel(prefix, counter, next) {
        let labelFound = true;
        let start = counter;
        let label = `${prefix}-${counter}`;

        next: while (labelFound) {
            for (var artifact in this.artifacts) {

                if (this.artifacts[artifact].label == label) {
                    label = `${prefix}-${next(counter)}`;
                    continue next;
                }

            }

            labelFound = false;

        }

        return label;

    }

    /**
     * Draw the Grid
     * 
     * @param {*} canvas the Cnnvas
     * @param {*} context  the Canvas's Context
     */
    drawGrid(canvas, context) {
        var rect = canvas.getBoundingClientRect();

        context.globalAlpha = 1.0;

        for (var yPos = 32; yPos < rect.height; yPos += 32) {
            context.beginPath();
            context.lineWidth = 0.5;
            context.setLineDash([1, 7]);
            context.strokeStyle = "rgba(0, 0, 0, 0.3)";
            context.moveTo(0, yPos);
            context.lineTo(rect.width, yPos);
            context.stroke();
        }

        for (var xPos = 32; xPos < rect.width; xPos += 32) {
            context.beginPath();
            context.lineWidth = 0.5;
            context.setLineDash([1, 7]);
            context.strokeStyle = "rgba(0, 0, 0, 0.3)";
            context.moveTo(xPos, 0);
            context.lineTo(xPos, rect.height);
            context.stroke();
        }

        for (var xPos = 64; xPos < rect.width; xPos += 32) {

            for (var yPos = 32; yPos < rect.height; yPos += 32) {
                context.beginPath();
                context.setLineDash([0, 0]);
                context.lineWidth = 0.4;
                context.strokeStyle = "rgba(0, 0, 0, 0.3)";
                context.arc(xPos, yPos, 1, 0, 2 * Math.PI);
                context.stroke();
            }

        }

    }

    /**
     * Select the artifact if selected
     * 
     * @param {integer} x the 'x' location
     * @param {integer} y the 'y' location
     */
    getArtifact(x, y) {

        for (var artifact in this.artifacts) {

            if (this.artifacts[artifact].intersects(x, y)) {
                return this.artifacts[artifact];
            }

        }

        return null;

    }

    /**
     * Select the arc if selected
     * 
     * @param {integer} x the 'x' location
     * @param {integer} y the 'y' location
     */
    getArc(x, y) {
        var point = {
            x: x,
            y: y
        }

        for (var artifact in this.artifacts) {

            var arc = this.artifacts[artifact].getArc(point);

            if (arc) {
                return arc;
            }

        }

        return null;

    }

    /**
     * Select the segment if selected
     * 
     * @param {integer} x the 'x' location
     * @param {integer} y the 'y' location
     */
    getSegment(x, y) {

        for (var artifact in this.artifacts) {
            var segment = this.artifacts[artifact].getSegment(x, y);

            if (segment) {
                return segment;
            }

        }

        return null;

    }

    /**
     * Select the artifact if selected
     * 
     * @param {integer} x the 'x' location
     * @param {integer} y the 'y' location
     */
    getArtifact(x, y) {

        for (var artifact in this.artifacts) {

            if (this.artifacts[artifact].intersects(x, y)) {
                return this.artifacts[artifact];
            }

        }

        return null;

    }

    /**
     * Reset
     */
    reset() {
        for (var artifact in this.artifacts) {

            this.artifacts[artifact].reset();

        }

    }

    /**
     * Reset Selection
     */
    resetSelection(mousePos) {

        for (var artifact in this.artifacts) {

            this.artifacts[artifact].reset(mousePos);

        }

    }

    /**
     * Set Selection
     */
    setSelection(mousePos) {

        for (var artifact in this.artifacts) {

            this.artifacts[artifact].setSelection(mousePos);

        }

    }

    /**
     * Delete Selection 
     */
    deleteSelection() {

        for (var artifact in this.artifacts) {

            if (this.artifacts[artifact].selected) {

                this.artifacts[artifact].deleteArcs();
                this.__treeMap[this.artifacts[artifact].id].removeNode();

            }

            this.artifacts[artifact].deleteSelectedArcs();
            this.artifacts[artifact].deleteSegments();

        }

        var filtered = this.artifacts.filter(function(value, index, arr) {

            return value.selected == false;

        });

        this.artifacts = filtered;

    }

    /**
     * Set the Dimension of the Grid
     * 
     * @param canvas the Canvas Element
     */
    setDimension(canvas) {

        this.__dimension = {
            w: 0,
            h: 0
        }

        for (var artifact in this.artifacts) {
            this.__dimension.w = Math.max(this.__dimension.w, this.artifacts[artifact].x);
            this.__dimension.h = Math.max(this.__dimension.h, this.artifacts[artifact].y);
        }

        var width = Math.max(this.__dimension.w + 100, $(window).width());
        var height = Math.max(this.__dimension.h + 100, $(window).height());

        canvas.style.width = (width - 40) + 'px';
        canvas.style.height = (height - 36) + 'px';

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

    }

    /**
     * Move selected Artifacts
     * 
     * @param origin The origin position
     * @param mousePos The current position
     * 
     */
    move(origin, mousePos) {
        var deltaX = mousePos.x - origin.x;
        var deltaY = mousePos.y - origin.y;

        for (var artifact in this.artifacts) {

            if (this.artifacts[artifact].selected) {
                this.artifacts[artifact].move(deltaX, deltaY);
            }

            this.artifacts[artifact].reposition(deltaX, deltaY);

        }

    }

    /**
     * Position selected Artifacts
     * 
     */
    position() {

        for (var artifact in this.artifacts) {

            if (this.artifacts[artifact].selected) {
                this.artifacts[artifact].position();
            }

            this.artifacts[artifact].positionSegments();

        }

    }

    /**
     * Clear the Grid
     * @param {*} canvas the active Canvas
     * @param {*} context the Canvas's context
     */
    clearGrid(canvas, context) {
        var rect = canvas.getBoundingClientRect();

        context.clearRect(rect.x - 100, rect.y - 100,
            Math.max(canvas.width * 10, this.__dimension.w * 10),
            Math.max(canvas.height * 10, this.__dimension.h * 10));

    }

    /**
     * Draw the Objects
     * 
     */
    draw() {

        this.setDimension(this.__canvas);

        var context = this.__canvas.getContext('2d');

        this.clearGrid(this.__canvas, context);

        if (this.environment.grid) {
            this.drawGrid(this.__canvas, context);
        }

        if (this.__selection) {

            context.beginPath()
            context.rect(
                this.__selection.startX, this.__selection.startY,
                this.__selection.endX - this.__selection.startX,
                this.__selection.endY - this.__selection.startY);

            context.setLineDash([5, 2]);
            context.strokeStyle = "rgba(0, 0, 0, 0.9)";
            context.stroke();

        }

        context.setLineDash([1, 0]);

        for (var iArtifact in this.artifacts) {
            this.artifacts[iArtifact].draw(context);
        }

        for (var iArtifact in this.artifacts) {
            this.artifacts[iArtifact].drawSourceArcs(context);
        }

    }

    /**
     * Select the artifacts
     * 
     * @param {object} artifact the Artifacts
     * @param {object} artifact the Artifacts
     * @param {object} connector the Connector
     */
    drawWithConnector(canvas, artifact, connector) {
        var context = canvas.getContext('2d');

        this.clearGrid(canvas, context);

        if (this.environment.grid) {
            this.drawGrid(canvas, context);
        }

        artifact.drawConnector(context, connector.x, connector.y);

        for (var iArtifact in this.artifacts) {
            this.artifacts[iArtifact].draw(context);
        }

        for (var iArtifact in this.artifacts) {
            this.artifacts[iArtifact].drawSourceArcs(context);
        }

    }

    /**
     * Select the Artifacts
     * 
     * @param {object} mousePos the Mouse Position
     */
    selectArtifacts(mousePos) {

        for (var iArtifact in this.artifacts) {
            this.artifacts[iArtifact].selectOnIntersection(mousePos);
        }

    }

    /**
     * Select the Arcs
     * 
     * @param {object} mousePos the Mouse Position
     */
    selectableArcs(mousePos) {
        var point = {
            x: mousePos.x,
            y: mousePos.y
        }

        for (var iArtifact in this.artifacts) {
            this.artifacts[iArtifact].selectableArcs(point);
        }

    }

    /**
     * Select the Arcs
     * 
     * @param {object} mousePos the Mouse Position
     */
    actionableArtifacts(mousePos) {
        var point = {
            x: mousePos.x,
            y: mousePos.y
        }

        for (var iArtifact in this.artifacts) {
            this.artifacts[iArtifact].actionable(point);
            this.artifacts[iArtifact].arcActionable(point);

        }

    }

    /**
     * Select the Objects
     * 
     * @param {object} selection the Selection Square
     */
    selectContainedArtifacts(selection) {

        for (let iArtifact in this.artifacts) {

            if (this.artifacts[iArtifact].selectContained(selection)) {
                this.artifacts[iArtifact].showMenu = false;
                this.artifacts[iArtifact].showArcMenu(false);
            }

        }

    }

    /**
     * Add Segment if the cursor is on the line
     * 
     * @param {*} mousePos the Mouse Position
     */
    addSegment(mousePos) {

        let point = {
            x: mousePos.x,
            y: mousePos.y
        }

        for (var iArtifact in this.artifacts) {

            if (this.artifacts[iArtifact].addSegment(point)) {
                return true;
            }

        }

        return false;

    }

    enableConnectionButtons() {

        var filtered = this.artifacts.filter(function(value, index, arr) {

            return value.selected == true && value.type <= 1;

        });

        if (filtered.length == 2 && filtered[0].type != filtered[1].type) {
            this.environment.joinEnabled(true);
            return true;
        }

        return false;

    }

    mouseup(event) {

        if (this.__point) {
            this.__point = false;
            return;
        }

        this.environment.joinEnabled(false);
        var mousePos = this.getMousePos($('#canvas')[0], event);

        if (this.__moveArtifacts) {

            this.__moveArtifacts = false;

            this.position();

            this.draw();
            this.__origin = null;

            return;

        }

        this.__moveArtifacts = false;

        if (this.__selection) {
            this.selectContainedArtifacts(this.__selection);
            this.setSelection(mousePos);

            this.__selection = null;

            var target = this.getArtifact(mousePos.x, mousePos.y);

            if (target != null) {
                target.selected = true;
            }

            this.enableConnectionButtons();
            this.draw();

            return;

        }

        if (this.__source) {
            this.__source.selectable = false;

            var target = this.getArtifact(mousePos.x, mousePos.y);

            if (target != null && target != this.__source && target.category != this.__source.category && target.joinable) {
                var sourceArc = target.addSource(this.environment.connector, this.__source);
                this.__source.addTarget(this.environment.connector, target, sourceArc);

                sourceArc.selected = true;

            }

            this.__drawConnector = false;
            this.__source = null;

            return;

        }

    }

    mousemove(event) {
        var mousePos = this.getMousePos($('#canvas')[0], event);

        if (this.__moveArtifacts) {

            if (!this.__origin) {

                this.__origin = {
                    x: mousePos.x,
                    y: mousePos.y
                }

            }

            this.move(this.__origin, mousePos);
            this.draw();

            this.__origin = {
                x: mousePos.x,
                y: mousePos.y,
            }

            return;

        } else if (this.__selection) {
            this.__selection['endX'] = mousePos.x;
            this.__selection['endY'] = mousePos.y;
            this.selectContainedArtifacts(this.__selection);

            this.draw();
        } else if (this.__source) {
            this.selectArtifacts(mousePos);
            this.__source.selectable = true;
            this.drawWithConnector(this.__canvas, this.__source, mousePos);
        } else {
            this.selectArtifacts(mousePos);
            this.selectableArcs(mousePos);
            this.actionableArtifacts(mousePos)
            this.draw();
        }

    }

    mousedown(event) {
        var mousePos = this.getMousePos(canvas, event);
        var arc = this.getArc(mousePos.x, mousePos.y);
        var segment = this.getSegment(mousePos.x, mousePos.y);

        if (this.__shiftDown) {
            var artifact = this.getArtifact(mousePos.x, mousePos.y);

            if (artifact || segment) {

                this.__origin = {
                    x: mousePos.x,
                    y: mousePos.y
                }

            } else {
                this.__origin = null;
            }

            this.__moveArtifacts = true;

            return;

        } else {
            this.reset();
        }

        this.__moveArtifacts = false;

        if (this.__drawConnector && !this.__source) {
            this.__source = this.getArtifact(mousePos.x, mousePos.y);
        }

        if (this.__source && this.__source.joinable) {
            this.drawWithConnector(this.__canvas, this.__source, mousePos);
            return;
        }

        if (this.__segment) {
            this.__segment.selected = true;
            this.__moveArtifacts = true;
            this.draw();
            return;
        }

        if (!this.getArtifact(mousePos.x, mousePos.y) && this.__drawConnector && this.addSegment(mousePos)) {
            this.__point = true;
            this.draw();
            return;
        }

        var artifact = this.getActionable(mousePos);

        if (artifact) {
            artifact.showMenu = true;
            artifact.selected = true;
            this.draw();
            return;
        }

        var artifact = this.getArtifact(mousePos.x, mousePos.y);

        if (artifact) {
            artifact.selected = true;
            this.__moveArtifacts = true;

            this.__origin = {
                x: mousePos.x,
                y: mousePos.y
            }

            this.draw();
            return;

        }

        var segment = this.getSegment(mousePos.x, mousePos.y);

        if (segment) {
            segment.selected = true;
            this.__moveArtifacts = true;
            this.__origin = {
                x: mousePos.x,
                y: mousePos.y
            }
            this.draw();
            return;
        }

        var arc = this.getArc(mousePos.x, mousePos.y);

        if (arc) {
            arc.selected = true;
            arc.showMenu = true;
            this.draw();
            return;
        }

        this.__selection = {};
        this.__selection['startX'] = mousePos.x;
        this.__selection['startY'] = mousePos.y;
        this.__selection['endX'] = mousePos.x;
        this.__selection['endY'] = mousePos.y;

        this.resetSelection(mousePos);

    }

    click(event) {
        var mousePos = this.getMousePos(canvas, event);

        for (let iArtifact in this.artifacts) {
            this.artifacts[iArtifact].action(this, mousePos);
            this.artifacts[iArtifact].arcAction(this, mousePos);
        }

        this.draw();

    }

    dblclick(event) {
        var mousePos = this.getMousePos(canvas, event);

        var artifact = this.getArtifact(mousePos.x, mousePos.y);

        if (artifact) {

            if (artifact.dblclick(this, mousePos)) {
                return;
            }

        }

    }

    getActionable(mousePos) {

        for (let iArtifact in this.artifacts) {
            if (this.artifacts[iArtifact].isActionable(mousePos)) {
                return this.artifacts[iArtifact];
            }

        }

        return null;

    }

    ondrop(event) {

        $(".actions").css({
            "border-color": "rgba(255,255,255,1.0)",
            "background-color": "rgba(255,255,255,1.0)"
        });

        var mousePos = this.getMousePos(canvas, event);
        var data = event.dataTransfer.getData("Text");

        this.__origin = {
            x: mousePos.x,
            y: mousePos.y
        }

        this.resetSelection(mousePos);

        switch (data) {

            case "place_mode":
                this.__creator[PLACE](mousePos);

                this.draw();

                break;

            case "event_mode":
                this.__creator[EVENT](mousePos);

                this.draw();

                break;

            case "process_mode":
                this.__creator[PROCESS](mousePos);

                this.draw();

                break;

            case "container_mode":
                this.__creator[CONTAINER](mousePos);

                this.draw();

                break;

        }

        this.__moveArtifacts = false;

    }

    keydown(event) {

        this.__shiftDown = (event.shiftKey && event.key == "Shift");
        this.__drawConnector = (event.ctrlKey && event.key == "Control" || event.altKey && event.key == "Alt");
        this.__environment.connector = event.key == "Control" ? 0 : event.key == "Alt" ? 1 : -1;

        if (event.key == "Delete") {

            this.deleteSelection();
            this.draw();

        }

    }

    keyup(event) {

        this.__drawConnector = false;
        this.__shiftDown = false;

        this.position();

        this.draw();

        this.__origin = null;

    }

    mouseout(event) {

        this.__source = false;
        this.__drawConnector = false;
        this.__moveArtifacts = false;

        this.draw();

    }

    fill(color) {

        for (var iArtifact in this.artifacts) {
            if (this.artifacts[iArtifact].selected) {

                if ('color' in this.artifacts[iArtifact]) {
                    this.artifacts[iArtifact].color = color;
                }

            }

            this.artifacts[iArtifact].colorSelectedArcs(color);

        }

    }

    trash(event) {

        this.deleteSelection();
        this.draw();

    }

    join(sourceType, targetType) {
        class Param {
            constructor(type) {
                this.__type = type;
            }

            get type() {
                return this.__type;
            }

        }

        var sources = this.artifacts.filter(function(value, index, arr) {
            return value.type == this.type && value.selected == true;

        }, new Param(sourceType));

        var targets = this.artifacts.filter(function(value, index, arr) {
            return value.type == this.type && value.selected == true;

        }, new Param(targetType));

        if (sources.length == 1 && targets.length == 1) {

            sources[0].addTarget(this.environment.connector, targets[0],
                targets[0].addSource(this.environment.connector, sources[0]));

            this.draw();

        }

    }

}