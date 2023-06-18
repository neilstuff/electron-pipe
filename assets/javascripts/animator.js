class Animator {
    constructor(window, canvas) {
        this.window = window;
        this.canvas = canvas;

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