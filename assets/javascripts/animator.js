class Animator {
    constructor(window, context) {
        this.window = window;
        this.context = context;



    }

    slope(a, b) {
        if (a[0] == b[0]) {
            return null;
        }

        return (b[1] - a[1]) / (b[0] - a[0]);
    }

    intercept(point, slope) {
        if (slope === null) {
            // vertical line
            return point[0];
        }

        return point[1] - slope * point[0];
    }

    getCordinates(source, target) {
        var m = slope(A, B);
        var b = intercept(A, m);

        var coordinates = [];
        for (var x = A[0]; x <= B[0]; x++) {
            var y = m * x + b;
            coordinates.push([x, y]);
        }

        console.log(coordinates);

    }
    
    drawBall() {
        this.context.beginPath();
        this.context.arc(x, y, 10, 0, Math.PI * 2);
        this.context.fillStyle = "#0095DD";
        this.context.fill();
        this.context.closePath();
    }

    animate(artiacts) {
        var completed = false;

        function animate(timeStamp) {

            if (!completed) {
                this.window.requestAnimationFrame(animate);
            }

        }

    }

}