class Animator {
    constructor(canvas) {

        this.__context = canvas.getContext('2d');
    }

    getCoordinates(source, target) {
        function calculateCourse(source, target) {
            var dx = (source[0] > target[0]) ? source[0] - target[0] : target[0] - source[0];
            var dy = (source[0] > target[0]) ? source[1] - target[1] : target[1] - source[1];

            var updater = 
               (source[0] < target[0]) || (source[0] == target[0] &&  source[1] < target[1]) ? 
               function(coordinates, coordinate) {
               coordinates.push(coordinate);
            } : 
            function(coordinates, coordinate) {
                coordinates.unshift(coordinate);
            };

            return {
                dx :dx,
                dy: dy,
                source : {
                    x : (source[0] > target[0]) ? target[0] : source[0],
                    y : (source[0] == target[0]) ? (source[1] < target[1] ? source[1] : target[1]) : (source[0] > target[0]) ? target[1] : source[1]
                },
                target : {
                    x : (source[0] > target[0]) ? source[0] : target[0],
                    y : (source[0] == target[0]) ? (source[1] < target[1] ? target[1] : source[1]) : (source[0] > target[0]) ? source[1] : target[1] 
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

            x = (course.dx == 0) ? course.source.x : course.source.x + i;
            y = (course.dx == 0) ? y + 8 : Math.round(course.source.y + (i * course.dy) / course.dx);

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
        var events = Object.keys(animations);

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

            for (var event in events) {

                points.push.apply(points, advance(animations[events[event]].sourcePaths));

            }

            if (points.length > 0) {

                draw(false);

                self.drawBalls(self.__context, points);

                window.requestAnimationFrame(animate);

            } else {
                for (var event in events) {

                    points.push.apply(points, advance(animations[events[event]].targetPaths));

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