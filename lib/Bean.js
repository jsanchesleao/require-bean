"use strict";

var constants = require('./constants');
var DependencyList = require('./DependencyList');
var inspector = require('./inspector');

function Bean(config){
    this.name = config.name;
    this.container = config.container;
    this.dependencyList = getDependencyList(config);
    this.factory = config.factory;
    this.scope = config.scope || constants.SINGLETON;
    this.object = null;
}

Bean.prototype.isSingleton = function(){
    return this.scope === constants.SINGLETON;
};

Bean.prototype.resolve = function(callback){
    return  this.handleInstantiated(callback) ||
            this.handleResolved(callback)     ||
            this.handleUnresolved(callback);
};

Bean.prototype.handleInstantiated = function(callback){
    if( this.container.isInstantiated( this.name ) ){
        callback(this.container.getInstantiatedBean(this.name) );
        return true;
    }
    return false;
};

Bean.prototype.handleResolved = function(callback){
    if( this.dependencyList.resolved ){
        return this.handleAsynchronousReturn() ||
            this.handleSynchronousReturn(callback);
    }
    return false;
};

Bean.prototype.handleUnresolved = function(callback){
    try{
        return this.resolveAsynchronousReturnDependency(callback) ||
            this.resolveDependencies(callback);
    }
    catch(err){
        throw Error('Cannot wire bean ['+this.name+']. Unresolved dependency: ['+this.dependencyList.nextUnresolved().name+']');
    }

};

Bean.prototype.resolveAsynchronousReturnDependency = function(callback){
    var self = this;
    if( this.dependencyList.nextUnresolved().is('$return') ){
        this.dependencyList.nextUnresolved().resolve(function(bean){
            self.object = bean;
            self.container.saveResolvedBean(self);
            callback(bean);
        });
        self.resolve(callback);
        return true;
    }
    return false;
};

Bean.prototype.resolveDependencies = function(callback){
    var self = this;
    this.container.getBean( this.dependencyList.nextUnresolved().name).resolve(function(dependency){
        self.dependencyList.nextUnresolved().resolve(dependency);
        self.resolve(callback);
    });
    return true;
};

Bean.prototype.handleAsynchronousReturn = function(){
    if( this.dependencyList.has('$return') ){
        this.dependencyList.apply( this.container.getBean( this.name ).factory );
        return true;
    }
    return false;
};

Bean.prototype.handleSynchronousReturn = function(callback){
    this.object = this.dependencyList.apply( this.factory );
    this.container.saveResolvedBean(this);
    callback(this.object);
    return true;
};

function getDependencyList(config){
    if( config.dependencyList !== constants.RESOLVE ){
        return new DependencyList( config.dependencyList );
    }
    return new DependencyList( inspector.extractParameters(config.factory) );
}


module.exports = Bean;