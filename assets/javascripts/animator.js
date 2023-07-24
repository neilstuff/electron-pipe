class Animator {
    constructor(canvas) {

        this.__context = canvas.getContext('2d');
    }

    getCoordinates(source, target) {
        function calculateCourse(source, target) {

            var dx = (source[0] > target[0]) ? source[0] - target[0] : target[0] - source[0];
            var dy = (source[0] > target[0]) ? source[1] - target[1] : target[1] - source[1];

            var updater = (source[0] < target[0]) ? function(coordinates, coordinate) {
                console.log("PUSH", coordinate);
                coordinates.push(coordinate);
            } : 
            function(coordinates, coordinate) {
                console.log("UNSHIFT", coordinate);
                coordinates.unshift(coordinate);
            };

            return {
                dx :dx,
                dy: dy,
                source : {
                    x : (source[0] > target[0]) ? target[0] : source[0],
                    y : (source[0] > target[0]) ? target[1] : source[1]
                },
                target : {
                    x : (source[0] > target[0]) ? source[0] : target[0],
                    y : (source[0] > target[0]) ? source[1] : target[1] 
                },
                updater : updater
            }

        }

        var course = calculateCourse(source, target);

        console.log("DX - DY", course.dx, course.dy, course.source.x, course.source.y, course.target.x, course.target.y);
        var coordinates = [];

        var x = course.source.x;
        var y = course.source.y;

        for (var i = 16; x < course.target.x || (y < course.target.y); i += 8) {

            course.updater(coordinates, [x,y]);

            x = (x <  course.target.x) ? course.source.x + i : course.source.x;

            if (course.dy >= 0) {
                console.log("Y1", y);
                y = (y < course.target.y) ? (course.dx == 0 ? i : Math.round(course.source.y + (i *  course.dy) /  course.dx)) : course.target.y;
            } else {
                console.log("Y2", y, course.dy, course.dx, course.source.y);
                y = (y > course.target.y) ? (course.dx == 0 ? i : Math.round(course.source.y + (i *  course.dy) /  course.dx)) : course.source.y;
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

        var coordinates = [];

        for (var segment in segments) {
            to = [segments[segment].x, segments[segment].y];
            coordinates = coordinates.concat(this.getCoordinates(from, to));
            from = to;
        }

        to = [arc.target.x, arc.target.y]

        return coordinates.concat(this.getCoordinates(from, to));

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