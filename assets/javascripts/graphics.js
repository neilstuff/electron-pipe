'use strict'
class Graphics {
    
    constructor() {
    }

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
            canvas.arc(x , y , radius, from, to);
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

        var data = 
        {
            numberOfParts: 2,
            parts:{"pt": [confidence, 100 - confidence]},//percentage of each parts 
            colors:{"cs": ["rgba(0,100,0,0.8)", "rgba(255,0,0,0.5)"]}//color of each part
        };
    
        draw(data);

    }

}