class Player extends Engine {
    constructor(frame, canvas, images, environment) {
        super(frame, canvas, images, environment);

        this.__animator = new Animator(canvas);
        this.__canvas = canvas;

        this.__activators = {

        };

    }

    leave(id) { }

    notify() {

        document.getElementById("disable_menu").style.display = "inline-block";
        document.getElementById("disable_toolbar").style.display = "inline-block";
        document.getElementById("tool_menu").style.opacity = "0.5";
        document.getElementById("player_menu").style.display = "inline-block";
        document.getElementById("placeholder").style.display = "none";

        document.getElementById("disable_playbar").style.display = "none";

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
            "transition": this.__activators[transition.id],
            "timer": 0,
            "inputs": [],
            "sourceArcs": [],
            "outputs": [],
            "targetArcs": []
        }

        console.log(this.__activators[transition.id].transition.id);

        for (var targetArc in transition.sourceArcs) {
            var sourceId = transition.sourceArcs[targetArc].sourceId;

            this.environment.placeStateMap[sourceId].tokens = this.environment.placeStateMap[sourceId].tokens -
                transition.sourceArcs[targetArc].tokens;

            state.inputs.push(this.environment.artifactMap[sourceId]);
            state.sourceArcs.push(transition.sourceArcs[targetArc]);

        }

        for (var sourceArc in transition.targetArcs) {
            var targetId = transition.targetArcs[sourceArc].targetId;

            if (this.__activators[transition.id].elapsed == 0) {
                this.environment.placeStateMap[targetId].tokens = this.environment.placeStateMap[targetId].tokens +
                    transition.targetArcs[sourceArc].tokens;

            }

            this.environment.placeStateMap[targetId].display = false;

            state.outputs.push(this.environment.artifactMap[targetId]);
            state.targetArcs.push(transition.targetArcs[sourceArc]);

        }

        return state;

    }

    updateTransition(transition, activate = false) {
        var element = document.getElementById(`img-${transition.id}`);

        if (transition.type == PROCESS) {
            if (this.__activators[transition.id].isActive()) {
                element.style.border = "2px solid rgba(1, 50, 32)";
                element.style.borderRadius = "8px";
            }
        } else {
            if (activate) {
                element.style.border = "2px solid rgba(0, 0, 255, 0.6)";
            } else {
                element.style.border = "2px solid black";
            }
        }
    }

    updateState(place) {
        var tokens = this.environment.placeStateMap[place.id].tokens;
        var element = document.getElementById(`img-${place.id}`);

        if (tokens == 0) {
            element.src = "assets/images/circle.svg";
        } else {
            element.src = "assets/images/circle-dot.svg";
        }

    }

    filterEvents(eventType) {
        var filteredEvents = this.environment.artifacts.filter(function (value, index, arr) {

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

            return (value.type == eventType && checkSources(this, value));



        });

        return filteredEvents;

    };

    /**
     * Draw the Objects
     * 
     */
    draw() {
        var context = this.canvas.getContext('2d');

        this.clearGrid(this.__canvas, context);

        for (var iArtifact in this.artifacts) {

            if (this.artifacts[iArtifact].type == PROCESS || this.artifacts[iArtifact].type == EVENT) {
                this.artifacts[iArtifact].draw(context);
                this.__activators[this.artifacts[iArtifact].id].draw();
            } else {
                this.artifacts[iArtifact].draw(context);
            }

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

                var filteredPlaces = this.artifacts.filter(function (value, index, arr) {
                    return value.type == PLACE;
                });

                for (var artifact in filteredPlaces) {
                    this.environment.placeStateMap[filteredPlaces[artifact].id].display = true;
                    this.updateState(filteredPlaces[artifact]);
                }

                if (this.artifacts[iArtifact].id in this.environment.activeTransitionMap) {

                    var context = this.canvas.getContext('2d');

                    this.artifacts[iArtifact].activate(context);


                    this.updateTransition(this.artifacts[iArtifact], true);
                } else if (this.artifacts[iArtifact].type == EVENT || this.artifacts[iArtifact].type == PROCESS) {
                    this.updateTransition(this.artifacts[iArtifact], false);
                }

            }

            if (this.artifacts[iArtifact].type == EVENT || this.artifacts[iArtifact].type == PROCESS) {
                this.__activators[this.artifacts[iArtifact].id].draw();
            } else {
                this.artifacts[iArtifact].draw(context);
            }

            this.artifacts[iArtifact].drawSourceArcs(context);

        }

    }

    /**
     * Sort the Artifacts given a type
     * 
     * @param {*} type either PLACE, PROCESS, EVENT
     * 
     */

    sortArtifacts(type) {
        return this.environment.artifacts.filter(function (value, index, arr) {
            return value.type == type;
        }).sort(function (from, to) {
            return (from.label < to.label ? -1 : from.label > to.label ? 1 : 0)
        });

    }

    /**
     * Show the State
     * 
     */
    show() {
        var places = this.sortArtifacts(PLACE);
        var events = this.sortArtifacts(EVENT);
        var processes = this.sortArtifacts(PROCESS);

        var playerMenu = document.getElementById("player_menu");

        var html = "";

        if (places.length > 0) {
            html = `<button class="collapsible">Places</button>`;
            html += `<div class="collapsible-content" style="margin-top:4px; margin-bottom:4px;">`;
            html += `<table style="margin-top: 4px;">`;

            for (var place in places) {
                html += `<tr style="height: 20px;">`;
                html += `<td>`;

                if (places[place].tokens > 0) {
                    html += `<img id="img-${places[place].id}" src="assets/images/circle-dot.svg" style="width:16px; height:16px; margin-top: -1px; margin-right:4px;"></img>`;
                } else {
                    html += `<img id="img-${places[place].id}" src="assets/images/circle.svg" style="width:16px; height:16px; margin-top: -1px; margin-right:4px;"></img>`;
                }

                html += `</td>`;
                html += `<td>`;
                html += places[place].label;
                html + `</td>`;
                html + `</tr>`;
            }

        }

        html += `</table>`;
        html += `</div>`;


        if (events.length > 0) {
            html += `<button class="collapsible">Transitions (Events)</button>`;
            html += `<div class="collapsible-content" style="margin-top:4px; margin-bottom:4px;">`;
            html += `<table style="margin-top: 4px;">`;

            for (var event in events) {
                html += `<tr style="height: 20px; margin-top:4px;">`;
                html += `<td>`;

                if (this.environment.activeTransitionMap.hasOwnProperty(events[event].id)) {
                    html += `<img id="img-${events[event].id}" src="assets/images/square.svg" style="width:16px; ` +
                        `height:16px; margin-top:-2px; margin-right:4px; border-radius: 2px; border:2px solid rgba(0, 0, 255, 0.6);"></img>`;
                } else {
                    html += `<img id="img-${events[event].id}" src="assets/images/square.svg" style="width:16px; ` +
                        `height:16px; margin-top:-2px; margin-right:4px; border-radius: 2px; border:2px solid black;"></img>`;
                }

                html += `</td>`;
                html += `<td>`;
                html += events[event].label;
                html + `</td>`;
                html + `</tr>`;

            }

            html += `</table>`;
            html += `</div>`;
        }

        if (processes.length > 0) {
            html += `<button class="collapsible">Transitions (Processes)</button>`;
            html += `<div class="collapsible-content" style="margin-top:4px; margin-bottom:4px;">`;
            html += `<table style="margin-top: 4px;">`;

            for (var process in processes) {
                html += `<tr style="height: 20px; margin-top:4px;">`;
                html += `<td>`;

                console.log(processes[process].id, this.__activators[processes[process].id].elapsed);

                if (this.__activators[processes[process].id].isActive()) {
                    html += `<img id="img-${processes[process].id}" src="assets/images/cog.svg" style="width:16px; ` +
                        `height:16px; margin-top:-2px; margin-right:4px; border:2px solid rgba(1, 50, 32); border-radius:8px;"></img>`;
                } else {
                    html += `<img id="img-${processes[process].id}" src="assets/images/cog.svg" style="width:16px; ` +
                        `height:16px; margin-top:-2px; margin-right:4px;"></img>`;
                }

                html += `</td>`;
                html += `<td>`;
                html += processes[process].label;
                html + `</td>`;
                html + `</tr>`;

            }

            html += `</table>`;
            html += `</div>`;
        }

        playerMenu.innerHTML = html;

        setTimeout(function () {
            var collapsible = document.getElementsByClassName("collapsible");
            for (var content = 0; content < collapsible.length; content++) {
                collapsible[content].addEventListener("click", function () {

                    this.classList.toggle("collapsible-active");

                    var content = this.nextElementSibling;

                    if (content.style.maxHeight) {
                        content.style.maxHeight = null;
                    } else {
                        content.style.maxHeight = content.scrollHeight + "px";
                    }

                });

            }

            for (var content = 0; content < collapsible.length; content++) {
                collapsible[content].click();
            }

        }, 10);

    }

    /**
     * Start the Player
     * 
     * @param showMenu show the menu or not
     * 
     */
    start(showMenu = true) {

        this.environment.artifacts.forEach(function (value, index) {

            if (value.type == PROCESS || value.type == EVENT) {

                this.__activators[value.id] = new Activator(this.__canvas, value);

            }

        }, this);

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

        var filteredPlaces = this.environment.artifacts.filter(function (value, index, arr) {
            return value.type == PLACE;
        });

        for (var artifact in filteredPlaces) {
            this.environment.placeStateMap[filteredPlaces[artifact].id] = {
                tokens: filteredPlaces[artifact].tokens,
                color: "rgba(0,0,0,0.6)",
                display: true
            }

        }

        var filteredTransitions = this.environment.artifacts.filter(function (value, index, arr) {

            function checkSources(placeStateMap, transition) {

                for (var targetArc in transition.sourceArcs) {
                    var sourceId = transition.sourceArcs[targetArc].sourceId;
                    var requiredTokens = transition.sourceArcs[targetArc].tokens;

                    // Direcotr Arc conditions must have sufficient tokens to fire
                    if (transition.sourceArcs[targetArc].type == DIRECTOR && requiredTokens > placeStateMap[sourceId].tokens) {
                        return false;
                        // Inibitor Arc conditions are satisified this will prevent the transition from firing 
                    } else if (transition.sourceArcs[targetArc].type == INHIBITOR && requiredTokens >= placeStateMap[sourceId].tokens) {
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

        if (showMenu) {
            this.show(showMenu);
        } else {

            for (var iArtifact in this.artifacts) {
                var filteredPlaces = this.artifacts.filter(function (value, index, arr) {
                    return value.type == PLACE;
                });

                for (var artifact in filteredPlaces) {
                    this.updateState(filteredPlaces[artifact]);
                }

                if (this.artifacts[iArtifact].id in this.environment.activeTransitionMap) {
                    this.updateTransition(this.artifacts[iArtifact], true);
                } else if (this.artifacts[iArtifact].type == EVENT || this.artifacts[iArtifact].type == PROCESS) {
                    this.updateTransition(this.artifacts[iArtifact], false);
                }

            }

        }

    }

    mousemove(event) { }

    mouseout(event) { }

    mouseup(event) { }

    keyup(event) { }

    keydown(event) { }

    mousedown(event) { }

    dblclick(event) {

        this.click(event);

    }

    click(event) {
        var states = [];

        var filteredArtifacts = this.environment.artifacts.filter(function (value, index, arr) {
            return value.within(this);
        }, this.getMousePos($('#canvas')[0], event));

        if (filteredArtifacts.length > 0) {
            if (filteredArtifacts[0].id in this.environment.activeTransitionMap) {
                states.push(this.processTransition(filteredArtifacts[0]));
            }
        }

        var filteredEvents = this.environment.artifacts.filter(function (value, index, arr) {

            function checkSources(placeStateMap, transition) {

                for (var targetArc in transition.sourceArcs) {
                    var sourceId = transition.sourceArcs[targetArc].sourceId;
                    var requiredTokens = transition.sourceArcs[targetArc].tokens;

                    if (requiredTokens > placeStateMap[sourceId].tokens) {
                        return false;
                    } else if (transition.sourceArcs[targetArc].type == INHIBITOR && requiredTokens >= placeStateMap[sourceId].tokens) {
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

        for (var transition in filteredEvents) {
            this.environment.activeTransitionMap[filteredEvents[transition].id] = filteredEvents[transition].id;
            this.__activators[filteredEvents[transition].id].activate();
        }

        this.__animator.processStates(states, redraw);

    }

    restart() {

        this.start(false);

    }

    step() {
        var states = [];

        this.environment.artifacts.forEach(function (value, index) {

            if (value.type == PROCESS || value.type == EVENT) {


                if (this.__activators[value.id].isActive()) {
                    this.__activators[value.id].progress(parseInt(document.getElementById("progression").value));
                    this.__activators[value.id].draw();

                    if (this.__activators[value.id].elapsed == 0) {
                        var state = this.processTransition(this.__activators[value.id].transition);

                        state.sourceArcs = [];

                        states.push(state);
                    }
                }

            }

        }, this);

        var filterTransitions = this.environment.artifacts.filter(function (value, index, arr) {

            function checkSources(placeStateMap, transition) {

                for (var targetArc in transition.sourceArcs) {
                    var sourceId = transition.sourceArcs[targetArc].sourceId;
                    var requiredTokens = transition.sourceArcs[targetArc].tokens;

                    if (requiredTokens > placeStateMap[sourceId].tokens) {
                        return false;
                    } else if (transition.sourceArcs[targetArc].type == INHIBITOR && requiredTokens >= placeStateMap[sourceId].tokens) {
                        return false;
                    }

                }

                return true;

            }

            return (value.type == PROCESS && checkSources(this, value));

        }, this.environment.placeStateMap);

        for (var prop in this.environment.activeTransitionMap) {

            function validate(transition) {
                for (var targetArc in transition.sourceArcs) {
                    var sourceId = transition.sourceArcs[targetArc].sourceId;
                    var requiredTokens = transition.sourceArcs[targetArc].tokens;

                    if (requiredTokens > placeStateMap[sourceId].tokens) {
                        return false;
                    } else if (transition.sourceArcs[targetArc].type == INHIBITOR && requiredTokens >= placeStateMap[sourceId].tokens) {
                        return false;
                    }

                }

                return true;

            }

            if (this.environment.activeTransitionMap.hasOwnProperty(prop)) {

                var transition = this.environment.activeTransitionMap[[prop]];

                if (!validate(transition)) {
                    delete this.environment.activeTransitionMap[prop];
                }

            }
        }

        for (var transition in filterTransitions) {


            this.__activators[filterTransitions[transition].id].activate();
            this.__activators[filterTransitions[transition].id].progress(parseInt(document.getElementById("progression").value));

            this.environment.activeTransitionMap[filterTransitions[transition].id] = filterTransitions[transition].id;
            states.push(this.processTransition(filterTransitions[transition]));

        }

        this.__animator.processStates(states, redraw);

    }

}
