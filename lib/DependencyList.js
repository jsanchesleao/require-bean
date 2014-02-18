"use strict";

var Dependency = require('./Dependency');

function DependencyList(init){
    this.dependencies = [];
    if(init){
        for(var i = 0; i < init.length; i++){
            this.dependencies.push( new Dependency(init[i]) );
        }
    }

    Object.defineProperties(this,{
        resolved: {
            configurable: false,
            get: function(){
                for(var i = 0; i < this.dependencies.length; i++){
                    if( !this.dependencies[i].resolved ){
                        return false;
                    }
                }
                return true;
            }
        }
    });
}

DependencyList.prototype.add = function(dependency){
    this.dependencies.push(dependency);
}

DependencyList.prototype.nextUnresolved = function(){
    for( var i = 0; i < this.dependencies.length; i++){
        if( !this.dependencies[i].resolved ){
            return this.dependencies[i];
        }
    }
    return null;
}

DependencyList.prototype.has = function(name){
    for(var i = 0; i< this.dependencies.length; i++){
        if( this.dependencies[i].name === name ){
            return true;
        }
    }
    return false;
}

DependencyList.prototype.toArray = function(){
    return this.dependencies.map(function(dependency){
        return dependency.bean;
    });
}

DependencyList.prototype.apply = function(func){
    if(!this.resolved){
        throw Error('Cannot apply unresolved dependencies');
    }
    return func.apply(this, this.toArray() );
}

module.exports = DependencyList;