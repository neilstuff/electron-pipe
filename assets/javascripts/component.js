'use strict'
class Component {
    constructor(id) {
        let guid = () => {
            let s4 = () => {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();

        }

        this.__id = id == null ? guid() : id;

    }

    get id() {
        return this.__id;
    }

}