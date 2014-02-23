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
    this.instantiated = false;
}

Bean.prototype.isSingleton = function(){
    return this.scope === constants.SINGLETON;
};

Bean.prototype.resolve = function(callback){
    var self = this;
    this.instantiated = false;
    this.container.interceptorChain.preparePhase(this, callback, function(){
        self.handleInstantiated(callback) ||
        self.handleResolved(callback)     ||
        self.handleUnresolved(callback);
    })
};

Bean.prototype.handleInstantiated = function(callback){
    if( this.container.isInstantiated( this.name ) ){
        callback(null, this.container.getInstantiatedBean(this.name) );
        return true;
    }
    return false;
};

Bean.prototype.handleResolved = function(callback){
    if( this.dependencyList.resolved ){
        var self = this;
        this.container.interceptorChain.instantiationPhase(this, callback, function(){
            if( !self.instantiated ){
                self.object = self.dependencyList.apply( self.factory );
                self.container.saveResolvedBean(self);
                callback(null, self.object);
            }
        })
        return true;
    }
    return false;
};

Bean.prototype.handleUnresolved = function(callback){
    var self = this;
    this.container.interceptorChain.resolvePhase(this, callback, function(){
        if(self.resolveDependencies(callback)){
        }
        else{
            callback(Error('Cannot wire bean ['+self.name+']. Unresolved dependency: ['+self.dependencyList.nextUnresolved().name+']'), null );
        }
    });
};

Bean.prototype.resolveDependencies = function(callback){
    var nextDependency = null;
    try{
        nextDependency = this.container.getBean( this.dependencyList.nextUnresolved().name);
    }
    catch(err){
        console.error(err);
        return false;
    }

    var self = this;
    nextDependency.resolve(function(err, dependency){
        self.dependencyList.nextUnresolved().resolve(dependency);
        self.resolve(callback);
    });
    return true;
};

function getDependencyList(config){
    if( config.dependencyList !== constants.RESOLVE ){
        return new DependencyList( config.dependencyList );
    }
    return new DependencyList( inspector.extractParameters(config.factory) );
}


module.exports = Bean;