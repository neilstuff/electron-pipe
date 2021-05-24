'use strict'

class Segment {

    constructor(point) {

        this.__point = point;

        this.__selected = false;
        this.__selectable = false;

    }

    get point() {
        return this.__point;
    }

    get x() {
        return this.__point.x;
    }

    get y() {
        return this.__point.y;
    }

    get selected() {
        return this.__selected;
    }

    set selected(selected) {
        this.__selected = selected;
    }

    get selectable() {
        return this.__selectable;
    }

    set selectable(selectable) {
        this.__selectable = selectable;
    }

    set x(pointX) {

        this.__point.x = pointX;

    }

    set y(pointY) {

        this.__point.y = pointY;

    }

    move(deltaX, deltaY) {

        this.__point.x += deltaX;
        this.__point.y += deltaY;

    }

    contains(rectangle) {

        this.selected = (rectangle.startX < this.__point.x - 16 &&
            rectangle.endX > this.__point.x + 16 &&
            rectangle.startY < this.__point.y - 16 &&
            rectangle.endY > this.__point.y + 16);

    }

    get json() {

        return {
            x: this.__point.x,
            y: this.__point.y
        }

    }

}