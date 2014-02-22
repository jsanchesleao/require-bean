"use strict";

var async = require('async');

function Chain() {
    Object.defineProperties(this, {
        interceptors: {
            value: [],
            writable: false
        }
    })
    Object.seal(this);
}

Chain.prototype.push = function(interceptor){
    this.interceptors.push(interceptor);
}

Chain.prototype.registerPhase = function(_beanDef, callback){
    var beanDef = _beanDef;
    var chain = true;
    for(var i = 0; i < this.interceptors.length; i++){
        chain = this.interceptors[i].registerPhase(beanDef);
        if(!chain){
            break;
        }
    }
    if( chain ){
        callback(beanDef);
    }
}

Chain.prototype.preparePhase = function(bean, callback){
    async.waterfall(this.createBeanTaskList(bean, callback, 'preparePhase'), callback);
}

Chain.prototype.resolvePhase = function(bean, callback){
    async.waterfall(this.createBeanTaskList(bean, callback, 'resolvePhase'), callback);
}

Chain.prototype.instantiationPhase = function(bean, callback){
    async.waterfall(this.createBeanTaskList(bean, callback, 'instantiationPhase'), callback);
}

Chain.prototype.createBeanTaskList = function(bean, callback, method){
    var tasks = this.interceptors.map( function(interceptor){
        return function(bean, callback, next){ interceptor[method](bean, callback, next)  }
    });
    tasks.unshift(function(next){ next(null, bean, callback) });
    return tasks;
}


module.exports = Chain;