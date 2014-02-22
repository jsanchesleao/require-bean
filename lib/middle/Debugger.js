var Interceptor = require('./Interceptor');
var util = require('util');

function Debugger(){
}

util.inherits(Debugger, Interceptor);

Debugger.prototype.doRegisterPhase = function(beanDef){
    console.log('Registering bean definition', beanDef);
    return true;
};

Debugger.prototype.doPreparePhase = function(bean, callback, next){
    console.log('Entering prepare phase for bean [' + bean.name + ']');
    next(null, bean, callback);
};

Debugger.prototype.doResolvePhase = function(bean, callback, next){
    console.log('Trying to resolve bean [' + bean.name + ']');

    console.log('Next dependency is:',  bean.dependencyList.nextUnresolved().name);

    next(null, bean, callback);
};

Debugger.prototype.doInstantiationPhase = function(bean, callback, next){
    console.log('Instantiating bean [' + bean.name +'] ' );
    next(null, bean, callback);
};

module.exports = Debugger;
