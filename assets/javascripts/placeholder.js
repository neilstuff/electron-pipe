'use strict'
class Placeholder extends Graphics {
    constructor(canvas, place) {
        super();

        this.__context = canvas.getContext('2d');
        this.__place = place;
        this.__tokens = place.tokens;
        this.__marking = place.tokens;
        this.__color = "rgba(0,0,0,0.6)";

    }

    get tokens() {
        return this.__tokens;
    }

    set tokens(tokens) {
        this.__tokens = tokens;
    }

    addTokens(tokens) {

        this.__tokens += tokens;

    }

    subtractTokens(tokens) {

        this.__tokens -= this.__tokens <= 0 ? 0 : tokens;

    }

    mark() {

        this.__marking =  this.__tokens;

    }

    draw() {

        this.__place.draw(this.__context);
        this.__place.drawTokens(this.__context, this.__marking, this.__color);
        this.__place.drawIcon(this.__context, this.__marking > 0 ? 1.0 : 0.1);

    }

}