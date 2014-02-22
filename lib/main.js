var Container = require('./Container');
var constants = require('./constants');

var containers = {};
var middleware = require('./middle/middleware');


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