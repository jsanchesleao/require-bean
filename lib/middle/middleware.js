"use strict";

var AsyncReturnInterceptor = require('./AsyncReturnInterceptor');
var DebuggerInterceptor = require('./DebuggerInterceptor');
var RequireDirInterceptor = require('./RequireDirInterceptor');

exports.asyncReturnInterceptor = function(){ return new AsyncReturnInterceptor() };
exports.debuggerInterceptor = function(){ return new DebuggerInterceptor(); };
exports.requireDirInterceptor = function(){ return new RequireDirInterceptor(); };


