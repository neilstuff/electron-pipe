class Director extends Arc {
    constructor(source, target, environment, images) {
        super(0, source, target, environment, images);

    }

    drawArrow(context, xCenter, yCenter, x, y) {
        var aDir = Math.atan2(xCenter - x, yCenter - y);

        var i1 = 10;
        var i2 = 8;

        context.beginPath();
        context.lineWidth = 1;

        if (this.selected) {
            context.strokeStyle = "rgba(0, 0, 255, 0.4)";
            context.fillStyle = "rgba(0, 0, 255, 0.4)";
        } else if (this.selectable) {
            context.strokeStyle = "rgba(0, 0, 255, 0.4)";
            context.fillStyle = "rgba(0, 0, 255, 0.4)";
            context.setLineDash([1, 0]);

        } else {
            context.setLineDash([1, 0]);
            context.strokeStyle = "rgba(0, 0, 0, 0.6)";
            context.fillStyle = "rgba(0, 0, 0, 0.6)";
        }

        context.moveTo(x, y); // arrow tip
        context.lineTo(x + this.xCor(i1, aDir + 0.5), y + this.yCor(i1, aDir + 0.5));
        context.lineTo(x + this.xCor(i2, aDir), y + this.yCor(i2, aDir));
        context.lineTo(x + this.xCor(i1, aDir - 0.5), y + this.yCor(i1, aDir - 0.5));
        context.lineTo(x, y); // arrow tip
        context.stroke();
        context.fill();

    }

}