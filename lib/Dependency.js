"use strict";

function Dependency(name){
    Object.defineProperties(this, {
        name: {
            value: name,
            writable: false,
            configurable: false
        },
        resolved: {
            get: function(){
                return this.bean !== null && this.bean !== undefined;
            }
        }

    });
}

Dependency.prototype.is = function(name){
    return this.name === name;
}

Dependency.prototype.resolve = function(bean){
    this.bean = bean;
    Object.freeze(this);
}

module.exports = Dependency;
