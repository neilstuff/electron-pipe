'use strict'
class Graphics {

    constructor() { }

    getTextWidth(text, font) {
        var canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas"));
        var context = canvas.getContext("2d");
        context.font = font;
        var metrics = context.measureText(text);
        return metrics.width;
    }

    drawDonut(canvas, x, y, radius = 5, from, to, lineWidth = 4, strokeStyle = "#fff", confidence) {

        function draw(data) {
            canvas.beginPath();
            canvas.lineWidth = lineWidth;
            canvas.strokeStyle = strokeStyle;
            canvas.arc(x, y, radius, from, to);
            canvas.stroke();

            var parts = data.parts.pt;
            var colors = data.colors.cs;

            var df = 0;
            for (var part = 0; part < data.numberOfParts; part++) {
                canvas.beginPath();
                canvas.strokeStyle = colors[part];
                canvas.arc(x, y, radius, df, df + (Math.PI * 2) * (parts[part] / 100));
                canvas.stroke();
                df += (Math.PI * 2) * (parts[part] / 100);

            }

        }

        var data = {
            numberOfParts: 2,
            parts: { "pt": [confidence, 100 - confidence] }, //percentage of each parts 
            colors: { "cs": ["rgba(0,100,0,0.8)", "rgba(255,0,0,0.5)"] } //color of each part
        };

        draw(data);

    }

    getPointFromEnd(startX, startY, endX, endY, length) {
        var dx = startX - endX;
        var dy = startY - endY;
        var distance = Math.sqrt(dx * dx + dy * dy);

        dx /= distance;
        dy /= distance;

        return {
            x: endX - (length) * dx,
            y: endY - (length) * dy
        }

    }

    loadFile(filter, callback) {
        var loadButton = document.createElementNS("http://www.w3.org/1999/xhtml", "input");

        loadButton.setAttribute("type", "file");
        loadButton.accept = filter;

        loadButton.addEventListener('change', function (event) {
            callback(event.target.files);

            return false;

        }, false);

        loadButton.click();

    }

    base64Upload(file) {

        return new Promise((resolve, reject) => {
            const reader = new window.FileReader();

            reader.addEventListener('load', () => {
                resolve({ default: reader.result });
            });

            reader.addEventListener('error', err => {
                reject(err);
            });

            reader.addEventListener('abort', () => {
                reject();
            });

            reader.readAsDataURL(file);

        });

    }

    convertIcon(src) {

        return new Promise(async (accept, reject) => {

            var image = new Image();

            image.onload = function () {
                accept(image);

                return;
            }

            image.src = src

        });


    }

}