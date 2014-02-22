"use strict";

var util = require('util');
var Interceptor = require('./Interceptor');

function AsyncReturn(){
    this.asynchronousBeans = {};
}
util.inherits(AsyncReturn, Interceptor);

AsyncReturn.prototype.doPreparePhase = function(bean, callback, next){
    if( bean.dependencyList.has('$return') ){
        this.asynchronousBeans[bean.name] = true;
    }
    next(null, bean, callback);
}

AsyncReturn.prototype.doResolvePhase = function(bean, callback, next){
    if( bean.dependencyList.nextUnresolved().is('$return') ){
        this.dependencyList.nextUnresolved().resolve(function(resolvedBean){
            bean.object = resolvedBean;
            bean.container.saveResolvedBean(bean);
            callback(null, resolvedBean);
        });
        bean.resolve(callback);
    }
    else{
        next(null, bean, callback);
    }
}

AsyncReturn.prototype.doInstantiationPhase = function(bean, callback, next){
	if( this.asynchronousBeans[bean.name] ){
        bean.dependencyList.apply( bean.container.getBean( bean.name ).factory );
    }
    else{
        next(null, bean, callback);
    }
}

module.exports = AsyncReturn;