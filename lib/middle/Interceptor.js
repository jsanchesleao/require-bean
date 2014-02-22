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
    if( this.doRegisterPhase ){
        return this.doRegisterPhase(beanDef);
    }
    return true;
}

Interceptor.prototype.preparePhase = function(bean, callback, next){
    if( this.doPreparePhase ){
        this.doPreparePhase(bean, callback, next);
    }
    else{
        next(null, bean, callback);
    }
}

Interceptor.prototype.resolvePhase = function(bean, callback, next){
    if( this.doResolvePhase ){
        this.doResolvePhase (bean, callback, next);
    }
    else{
        next(null, bean, callback);
    }
}

Interceptor.prototype.instantiationPhase = function(bean, callback, next){
    if( this.doInstantiationPhase ){
        this.doInstantiationPhase(bean, callback, next);
    }
    else{
        next(null, bean, callback);
    }
}

module.exports = Interceptor;