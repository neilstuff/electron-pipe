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

        var coordinates = [];

        var x = course.source.x;
        var y = course.source.y;

        var step = (course.dy <= -280 || course.dy >= 280) ? 2 :  (course.dy <= -120 || course.dy >= 120) ? 4 : 8; 

        for (var iStep = 16; x < course.target.x || (y < course.target.y); iStep += step) {

            course.updater(coordinates, [x,y]);

            x = (course.dx == 0) ? course.source.x : course.source.x + iStep;
            y = (course.dx == 0) ? y + 8 : Math.round(course.source.y + (iStep * course.dy) / course.dx);

        }

        return coordinates;

    }

    drawToken(context, x, y, radius = 4) {

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = "#000000";
        context.fill();
        context.closePath();
    
    }
    
    drawTokens(context, points) {

        for (var point in points) {
            this.drawToken(context, points[point][0], points[point][1]);
        }

    }

    drawDestinations(context, destinations) {


        for (var destination in destinations) {
            this.drawToken(context, destinations[destination][0], destinations[destination][1], 6);
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
                
                sourcePaths.push({
                    "arc": arc,
                    "path": this.addPath(arc)
                });

            }

            for (var targetArc in states[state].targetArcs) {

                var arc = states[state].targetArcs[targetArc];

                targetPaths.push({
                    "arc": arc,
                    "path": this.addPath(arc)
                });

            }

            animations[transition.id] = {
                "sourcePaths": sourcePaths,
                "targetPaths": targetPaths,
                "transition": transition
            }

        }

        this.activate(animations, draw);

    };

    activate(animations, draw) {
        var self = this;
        var events = Object.keys(animations);
        var destinations = [];

        function animate(timeStamp) {
            var points = [];

            function advance(paths, destinations = null) {

                var positions = []

                for (var path in paths) {

                    if (destinations && paths[path]['path'].length == 1) {
                        var coordinate = [paths[path]['arc'].target.x, paths[path]['arc'].target.y];
                        
                        destinations.push(coordinate);
 
                    }

                    if (paths[path]['path'].length > 0) {
                        positions.push(paths[path]['path'].shift());
                    }   

                }

                return positions;

            }

            for (var event in events) {
 
                points.push.apply(points, advance(animations[events[event]].sourcePaths));

            }

            if (points.length > 0) {

                draw(false);

                self.drawTokens(self.__context, points);

                animations[events[event]].transition.draw(self.__context);
   
                window.requestAnimationFrame(animate);

            } else {
                for (var event in events) {

                    points.push.apply(points, advance(animations[events[event]].targetPaths, destinations));

                }

                if (points.length > 0) {

                    draw(false);

                    self.drawTokens(self.__context, points);
                    self.drawDestinations(self.__context, destinations);
                    
                    animations[events[event]].transition.draw(self.__context);

                    window.requestAnimationFrame(animate);

                } else {
                    draw(true);

                }
            }

        }

        window.requestAnimationFrame(animate);

    }

}