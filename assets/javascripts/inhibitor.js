class Inhibitor extends Arc {
    constructor(source, target, environment, images) {
        super(1, source, target, environment, images);

    }

    drawArrow(context, xCenter, yCenter, x, y, selected, selectable) {
        var aDir = Math.atan2(xCenter - x, yCenter - y);

        var i1 = 0;
        var i2 = 0;

        context.beginPath();
        context.lineWidth = 1;

        if (selected) {
            context.strokeStyle = "rgba(0, 0, 255, 0.4)";
            context.fillStyle = "rgba(255, 255,255,1.0)";
        } else if (selectable) {
            context.strokeStyle = "rgba(0, 0, 255, 0.4)";
            context.fillStyle = "rgba(255, 255,255,1.0)";
            context.setLineDash([1, 0]);

        } else {
            context.setLineDash([1, 0]);
            context.strokeStyle = "rgba(0, 0, 0, 0.6)";
            context.fillStyle = "rgba(255, 255,255,1.0)";
        }

        context.arc(x + this.xCor(i1, aDir + 0.5), y + this.yCor(i2, aDir), 5, 0, 2 * Math.PI);

        context.stroke();
        context.fill();

    }

}