"use strict";

function Interceptor(config){

    this.doRegisterPhase = function(beanDef){ return true }

    this.doPreparePhase = function(bean, callback, next){
        next(null, bean, callback);
    };

    this.doResolvePhase = function(bean, callback, next){
        next(null, bean, callback);
    };

    this.doInstantiationPhase = function(bean, callback, next){
        next(null, bean, callback);
    };

    Object.seal(this);

    if(config){
        this.doRegisterPhase = config.registerPhase || this.doRegisterPhase;
        this.doPreparePhase = config.preparePhase || this.doPreparePhase;
        this.doResolvePhase = config.resolvePhase || this.doResolvePhase ;
        this.doInstantiationPhase = config.instantiationPhase || this.doInstantiationPhase;
    }

    Object.freeze(this);
}

Interceptor.prototype.registerPhase = function(beanDef){
    return this.doRegisterPhase(beanDef);
}

Interceptor.prototype.preparePhase = function(bean, callback, next){
    this.doPreparePhase(bean, callback, next);
}

Interceptor.prototype.resolvePhase = function(bean, callback, next){
    this.doResolvePhase(bean, callback, next);
}

Interceptor.prototype.instantiationPhase = function(bean, callback, next){
    this.doInstantiationPhase(bean, callback, next);
}

module.exports = Interceptor;