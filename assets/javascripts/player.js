class Player extends Engine {
    constructor(frame, canvas, images, environment) {
        super(frame, canvas, images, environment);

        this.__animator = new Animator(canvas);

    }

    leave(id) {}

    notify() {

        document.getElementById("disable_menu").style.display = "inline-block";
        document.getElementById("tool_menu").style.opacity = "0.5";

        this.environment.decorate = false;
        this.start();

    }

    clear() {
        environment.tokenMap = {};
    }

    /**
     * Clear the Grid
     * @param {*} canvas the active Canvas
     * @param {*} context the Canvas's context
     */
    clearGrid(canvas, context) {
        var rect = canvas.getBoundingClientRect();

        context.clearRect(rect.x - 100, rect.y - 100,
            canvas.width * 10, canvas.height * 10);

    }

    /**
     * Process the transition
     * 
     * @param(*) transition the process transition
     * 
     * @return the new state
     * 
     */
    processTransition(transition) {
        var state = {
            "transition": transition,
            "timer" : 0,
            "inputs": [],
            "sourceArcs": [],
            "outputs": [],
            "targetArcs": []
        }

        for (var targetArc in transition.sourceArcs) {
            var sourceId = transition.sourceArcs[targetArc].sourceId;

            this.environment.placeStateMap[sourceId].tokens = this.environment.placeStateMap[sourceId].tokens -
                transition.sourceArcs[targetArc].tokens;

            state.inputs.push(this.environment.artifactMap[sourceId]);
            state.sourceArcs.push(transition.sourceArcs[targetArc]);

        }

        for (var sourceArc in transition.targetArcs) {
            var targetId = transition.targetArcs[sourceArc].targetId;

            this.environment.placeStateMap[targetId].tokens = this.environment.placeStateMap[targetId].tokens +
                transition.targetArcs[sourceArc].tokens;

            this.environment.placeStateMap[targetId].display = false;

            state.outputs.push(this.environment.artifactMap[targetId]);
            state.targetArcs.push(transition.targetArcs[sourceArc]);

        }

        return state;

    }

    /**
     * Draw the Objects
     * 
     */
    draw() {
        var context = this.canvas.getContext('2d');

        this.clearGrid(this.__canvas, context);

        for (var iArtifact in this.artifacts) {

            this.artifacts[iArtifact].draw(context);
            this.artifacts[iArtifact].drawSourceArcs(context);

            if (this.artifacts[iArtifact].id in this.environment.activeTransitionMap) {
                var context = this.canvas.getContext('2d');
                this.artifacts[iArtifact].activate(context);
            }

        }

    }

    /**
     * Update the Objects
     * 
     */
    redraw(activate = false) {
        var context = this.canvas.getContext('2d');

        this.clearGrid(this.__canvas, context);

        for (var iArtifact in this.artifacts) {

            if (activate) {

                var filteredPlaces = this.artifacts.filter(function(value, index, arr) {
                    return value.type == PLACE;
                });

                for (var artifact in filteredPlaces) {
                    this.environment.placeStateMap[filteredPlaces[artifact].id].display = true;
                }

                if (this.artifacts[iArtifact].id in this.environment.activeTransitionMap) {
                    var context = this.canvas.getContext('2d');
                    this.artifacts[iArtifact].activate(context);
                }

            }

            this.artifacts[iArtifact].draw(context);
            this.artifacts[iArtifact].drawSourceArcs(context);

        }

    }

    start() {

        for (var prop in this.environment.placeStateMap) {
            if (this.environment.placeStateMap.hasOwnProperty(prop)) {
                delete this.environment.placeStateMap[prop];
            }
        }

        for (var prop in this.environment.activeTransitionMap) {
            if (this.environment.activeTransitionMap.hasOwnProperty(prop)) {
                delete this.environment.activeTransitionMap[prop];
            }
        }

        var filteredPlaces = this.environment.artifacts.filter(function(value, index, arr) {
            return value.type == PLACE;
        });

        for (var artifact in filteredPlaces) {
            this.environment.placeStateMap[filteredPlaces[artifact].id] = {
                tokens: filteredPlaces[artifact].tokens,
                color: "rgba(0,0,0,0.6)",
                display: true
            }

        }

        var filteredTransitions = this.environment.artifacts.filter(function(value, index, arr) {

            function checkSources(placeStateMap, transition) {

                for (var targetArc in transition.sourceArcs) {
                    var sourceId = transition.sourceArcs[targetArc].sourceId;
                    var requiredTokens = transition.sourceArcs[targetArc].tokens;

                    if (requiredTokens > placeStateMap[sourceId].tokens) {
                        return false;
                    }

                }

                return true;

            }

            return ((value.type == EVENT || value.type == PROCESS) && checkSources(this, value));

        }, this.environment.placeStateMap);

        for (var transition in filteredTransitions) {
            this.environment.activeTransitionMap[filteredTransitions[transition].id] = filteredTransitions[transition].color;
        }

    }

    mousemove(event) {}

    mouseout(event) {}

    mouseup(event) {}

    keyup(event) {}

    keydown(event) {}

    mousedown(event) {}

    dblclick(event) {

        this.click(event);

    }

    click(event) {
        var states = [];

        var filteredArtifacts = this.environment.artifacts.filter(function(value, index, arr) {
            return value.within(this);
        }, this.getMousePos($('#canvas')[0], event));

        if (filteredArtifacts.length > 0) {
            if (filteredArtifacts[0].id in this.environment.activeTransitionMap) {
                states.push(this.processTransition(filteredArtifacts[0]));
            }
        }

        var filteredTransitions = this.environment.artifacts.filter(function(value, index, arr) {

            function checkSources(placeStateMap, transition) {

                for (var targetArc in transition.sourceArcs) {
                    var sourceId = transition.sourceArcs[targetArc].sourceId;
                    var requiredTokens = transition.sourceArcs[targetArc].tokens;

                    if (requiredTokens > placeStateMap[sourceId].tokens) {
                        return false;
                    }

                }

                return true;

            }

            return (value.type == EVENT && checkSources(this, value));

        }, this.environment.placeStateMap);

        for (var prop in this.environment.activeTransitionMap) {
            if (this.environment.activeTransitionMap.hasOwnProperty(prop)) {
                delete this.environment.activeTransitionMap[prop];
            }
        }

        for (var transition in filteredTransitions) {
            this.environment.activeTransitionMap[filteredTransitions[transition].id] = filteredTransitions[transition].color;
        }

        this.__animator.processStates(states, redraw);

    }

}