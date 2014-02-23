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

Interceptor.prototype.bind = function(container){
    return container;
};

Interceptor.prototype.registerPhase = function(beanDef){
    if( this.doRegisterPhase ){
        return this.doRegisterPhase(beanDef);
    }
    return true;
};

Interceptor.prototype.preparePhase = function(bean, callback, next){
    this.runPhase(bean, callback, next, 'doPreparePhase');
};

Interceptor.prototype.resolvePhase = function(bean, callback, next){
    this.runPhase(bean, callback, next, 'doResolvePhase');
};

Interceptor.prototype.instantiationPhase = function(bean, callback, next){
    this.runPhase(bean, callback, next, 'doInstantiationPhase');
};

Interceptor.prototype.runPhase = function(bean, callback, next, phaseName){
    try{
        if( this[phaseName] ){
            this[phaseName](bean, callback, next);
        }
        else{
            next(null, bean, callback);
        }
    }
    catch(err){
        callback(err, null);
    }
};

module.exports = Interceptor;