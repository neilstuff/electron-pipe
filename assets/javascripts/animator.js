class Animator {
    constructor(canvas) {

        this.__context = canvas.getContext('2d');
    }

    getCordinates(source, target) {
        const dx = target[0] - source[0];
        const dy = target[1] - source[1];

        console.log("DX - DY", dx, dy, source[0], source[1], target[0], target[1]);
        var coordinates = [];
        var x = (dx < 0 ) ? source[1] : source[0];
        var y = (dy < 0) ? source[0] : source[1];

        for (var i = 16; x < target[0] || (y < target[1] && dy >= 0); i += 8) {

            coordinates.push([x, y]);

            x = (x < target[0]) ? source[0] + i : source[0];

            if (dy >= 0) {
                console.log("Y1", y);
                y = (y < target[1]) ? (dx == 0 ? i : Math.round(source[1] + (i * dy) / dx)) : target[1];
            } else {
                console.log("Y2", y, dy, dx, source[1]);
                y = (y > target[1]) ? (dx == 0 ? i : Math.round(source[0] + (i * dy) / dx)) : source[1];
            }

        }

        return coordinates;

    }

    drawBalls(context, points) {

        for (var point in points) {
            context.beginPath();
            context.arc(points[point][0], points[point][1], 4, 0, Math.PI * 2);
            context.fillStyle = "#000000";
            context.fill();
            context.closePath();

        }

    }

    addPath(arc) {
        var segments = arc.segments;

        var from = [arc.source.x, arc.source.y];
        var to = null;

        for (var segment in segments) {
            to = [segment.x, segment.y];
            this.getCordinates(from, to);
            from = to;
        }

        to = [arc.target.x, arc.target.y]

        return this.getCordinates(from, to);

    }

    processStates(states, draw) {
        var animations = {}

        for (var state in states) {
            var transition = states[state].transition;

            var sourcePaths = [];
            var targetPaths = [];

            for (var sourceArc in states[state].sourceArcs) {
                var arc = states[state].sourceArcs[sourceArc];

                console.log("Source Arc: " + arc.id);

                sourcePaths.push(this.addPath(arc));

            }

            for (var targetArc in states[state].targetArcs) {
                var arc = states[state].targetArcs[targetArc];

                console.log("Target Arc: " + arc.id);

                targetPaths.push(this.addPath(arc));

            }

            animations[transition.id] = {
                "sourcePaths": sourcePaths,
                "targetPaths": targetPaths
            }

        }

        this.activate(animations, draw);

    };

    activate(animations, draw) {
        var self = this;
        var transitions = Object.keys(animations);

        console.log(JSON.stringify(animations));
        console.log(JSON.stringify(transitions));

        function animate(timeStamp) {
            var points = [];

            function advance(paths) {
                var positions = []

                for (var path in paths) {

                    if (paths[path].length > 0) {
                        positions.push(paths[path].shift());
                    }
                }

                return positions;

            }

            for (var transition in transitions) {

                points.push.apply(points, advance(animations[transitions[transition]].sourcePaths));

            }

            if (points.length > 0) {

                draw(false);

                self.drawBalls(self.__context, points);

                window.requestAnimationFrame(animate);

            } else {
                for (var transition in transitions) {

                    points.push.apply(points, advance(animations[transitions[transition]].targetPaths));

                }

                if (points.length > 0) {
                    draw(false);
                    self.drawBalls(self.__context, points);
                    window.requestAnimationFrame(animate);

                } else {

                    draw(true);

                }
            }

        }

        window.requestAnimationFrame(animate);

    }

}