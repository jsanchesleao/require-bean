var AsyncReturn = require('./AsyncReturn');
var Debugger = require('./Debugger');

exports.asyncReturn = function(){ return new AsyncReturn() };
exports.debuggerInterceptor = function(){ return new Debugger(); };


