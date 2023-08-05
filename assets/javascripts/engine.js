class Engine {
    constructor(frame, canvas, images, environment) {

        this.__frame = frame;
        this.__canvas = canvas;
        this.__images = images;

        this.__environment = environment;

    }

    get frame() {
        return this.__frame;
    }

    get environment() {
        return this.__environment;
    }

    get canvas() {
        return this.__canvas;
    }

    get images() {
        return this.__images;
    }

    get artifacts() {
        return this.__environment.artifacts;
    }

    set artifacts(artifacts) {
        this.__environment.artifacts = artifacts;
    }

    get artifactMap() {
        return this.__environment.artifactMap;
    }

    set artifactMap(artifactMap) {
        this.__environment.artifactMap = artifactMap;
    }

    /**
     * Get the Canvas Mouse Position
     * 
     * @param {canvas} canvas the Canvas
     * @param {event} evt the Mouse Event 
     */
    getMousePos(canvas, event) {
        var rect = canvas.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

    }

    restart() {
    }

    step() {
    }

}