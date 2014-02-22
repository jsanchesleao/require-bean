var Interceptor = require('./Interceptor');
var util = require('util');

function LoggerInterceptor(){
}

util.inherits(LoggerInterceptor, Interceptor);

LoggerInterceptor.prototype.doRegisterPhase = function(beanDef){
    console.log('Registering [' + beanDef.name + ']');
    return true;
}

module.exports = LoggerInterceptor;