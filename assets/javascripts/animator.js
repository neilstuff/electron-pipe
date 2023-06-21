class Animator {
    constructor(window, context) {
        this.window = window;
        this.context = context;



    }

    drawBall() {
        this.context.beginPath();
        this.context.arc(x, y, 10, 0, Math.PI*2);
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