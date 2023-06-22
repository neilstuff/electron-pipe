class Animator {
    constructor(window, canvas) {
        this.__window = window;
        this.__context = canvas.context;

        this.paths = [];

    }

    slope(source, target) {
        if (source == target) {
            return null;
        }

        return (target - source) / (target - source);
    }

    intercept(point, slope) {
        if (slope === null) {
            // vertical line
            return point[0];
        }

        return point[1] - slope * point[0];
    }

    getCordinates(source, target) {
        var m = slope(source, target);
        var b = intercept(source, m);

        var coordinates = [];
        for (var x = source; x <= target; x++) {
            var y = m * x + b;
            coordinates.push([x, y]);
        }

        console.log(coordinates);

        return coordinates;

    }

    drawBall() {
        this.context.beginPath();
        this.context.arc(x, y, 10, 0, Math.PI * 2);
        this.context.fillStyle = "#0095DD";
        this.context.fill();
        this.context.closePath();
    }

    addPath(arc) {
        var source = arc.getSource();
        var segments = arc.getSegments();

        var from = [source.x, source.y];
        var to = null;

        for (var segment in segments) {
            var to = [segment.x, segment.y];
        }

        getCordinates(from, to);

    }

    processStates(states) {

    };

    animate() {
        var completed = false;

        function animate(timeStamp) {

            if (!completed) {
                this.window.requestAnimationFrame(animate);
            }

        }

    }

}