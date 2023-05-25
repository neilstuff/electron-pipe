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

    drawConfidence(canvas, x, y, radius = 5, from, to, lineWidth = 5, strokeStyle = "#fff", confidence)
        {


           function(data) {
                canvas.beginPath();
                canvas.lineWidth = this.lineWidth;
                canvas.strokeStyle = this.strockStyle;
                canvas.arc(this.x , this.y , this.radius , this.from , this.to);
                canvas.stroke();
                var numberOfParts = data.numberOfParts;
                var parts = data.parts.pt;
                var colors = data.colors.cs;
                var df = 0;
                for (var i = 0; i < data.length; i++) {
                    canvas.beginPath();
                    canvas.strokeStyle = colors[i];
                    canvas.arc(this.x, this.y, this.radius, df, df + (Math.PI * 2) * (parts[i] / 100));
                    canvas.stroke();
                    df += (Math.PI * 2) * (parts[i] / 100);
                }

            }

            var data = 
            {
                numberOfParts: 2,
                parts:{"pt": [60 , 40]},//percentage of each parts 
                colors:{"cs": ["rgba(255,0,0,0.5)", "rgba(0,255,0,0.5)"]}//color of each part
            };

        
        drawDount.set(150, 150, 7, 0, Math.PI*2, 5, "#fff");
        drawDount.draw(data);

        }

}