'use strict'
class Component extends Graphics {
    constructor(id) {
        super();
        
        let guid = () => {
            let s4 = () => {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();

        }

        this.__id = id == null ? guid() : id;

        this.__selected = false;
        this.__selectable = false;

    }

    get id() {
        return this.__id;
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

}