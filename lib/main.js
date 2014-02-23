var Container = require('./Container');
var constants = require('./constants');

var containers = {};
var middleware = require('./middle/middleware');
var Interceptor = require('./middle/Interceptor');
var util = require('util');


exports.container = function(name){
    if( !containers[name] ){
        containers[name] = new Container(name);
    }
    return containers[name];
}

exports.SINGLETON = constants.SINGLETON;
exports.PROTOTYPE = constants.PROTOTYPE;
exports.RESOLVE   = constants.RESOLVE;


exports.middleware = middleware;

exports.Interceptor = function(construct){
    return util.inherits(construct, Interceptor);
}