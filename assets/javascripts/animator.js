class Animator {
    constructor(window, canvas) {
        this.window = window;
        this.canvas= canvas;

    }

    animate(paths) {
        var completed = false;

        function animate(timeStamp) {

            if (!completed) {
                this.window.requestAnimationFrame(animate);
            }

        }

    }

}
