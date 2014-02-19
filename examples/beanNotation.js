var app = require('../');

exports.name = 'test';
exports.dependencies = app.RESOLVE;
exports.scope = app.SINGLETON;

exports.factory = function(){
    return {value: 'test'}
}