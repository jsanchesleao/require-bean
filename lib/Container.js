"use strict";

var inspector = require('./inspector');
var naming = require('./namingConverter');

var Dependency = require('./Dependency');
var DependencyList = require('./DependencyList');
var constants = require('./constants');

function Container(name){
    this.name = name;
    this.beans = {};
    this.resolvedBeans = {};
}

Container.prototype.putBean = function(config){
    if( this.beans[config.name] ){
        throw new Error('Bean [' + config.name + '] is already registered');
    }
    this.beans[config.name] = {factory: config.factory, scope: config.scope, dependencies: config.dependencies}
};

Container.prototype.run = function(bean, func){
    if( bean.constructor === String ){
        this.checkRegistered(bean);
        this.require_bean(bean, func, this.getDependencies(bean));
    }
    else{
        var params = inspector.extractParameters(bean);
        this.checkRegistered(params[0]);
        this.require_bean(params[0], bean, this.getDependencies(params[0]));
    }
};

Container.prototype.checkRegistered = function(name){
    if( !this.beans[name] ){
        throw Error('Bean is not registered');
    }
}

Container.prototype.register = function(name, factory){
    this.putBean({
        name: name,
        dependencies: constants.RESOLVE,
        factory: factory,
        scope: constants.SINGLETON
    });
}

Container.prototype.register_module = function(modulename){
    this.register(naming.toCamelCase(modulename), function(){
        return require(modulename);
    });
}

Container.prototype.bean = function(beanDef){
    validateBeanDef(beanDef);
    this.putBean( {
        name: beanDef.name,
        dependencies: beanDef.dependencies || constants.RESOLVE,
        factory: beanDef.factory,
        scope: beanDef.scope || constants.SINGLETON
    });
}


Container.prototype.register_proto = function(name, factory){
    this.putBean({
        name: name,
        dependencies: constants.RESOLVE,
        factory: factory,
        scope: constants.PROTOTYPE
    });
}

Container.prototype.require_bean = function(name, callback, dependencyList){
    this.checkRegistered(name);

    return this.handleInstantiated(name, callback) ||
           this.handleResolved(name, callback, dependencyList) ||
           this.handleUnresolved(name, callback, dependencyList)
}

Container.prototype.handleInstantiated = function(beanName, callback){
    if( this.resolvedBeans[beanName] ){
        callback(this.resolvedBeans[beanName]);
        return true;
    }
    return false;
}

Container.prototype.handleResolved = function(name, callback, dependencyList){
    if( dependencyList.resolved ){
        return this.handleAsynchronousReturn(name, dependencyList) ||
               this.handleSynchronousReturn(name, callback, dependencyList);
    }
    return false;
}

Container.prototype.handleUnresolved = function(name, callback, dependencyList){
    try{
        return this.resolveAsynchronousReturnDependency(name, callback, dependencyList) ||
               this.resolveDependencies(name, callback, dependencyList);
    }
    catch(err){
        throw Error('Cannot wire bean ['+name+']. Unresolved dependency: ['+dependencyList.nextUnresolved().name+']');
    }

}

Container.prototype.resolveAsynchronousReturnDependency = function(name, callback, dependencyList){
    var container = this;
    if( dependencyList.nextUnresolved().is('$return') ){
        dependencyList.nextUnresolved().resolve(function(bean){
            container.saveResolvedBean(name, bean);
            callback(bean);
        })
        container.require_bean(name, callback, dependencyList);
        return true;
    }
    return false;
}

Container.prototype.resolveDependencies = function(name, callback, dependencyList){
    var container = this;
    this.require_bean(dependencyList.nextUnresolved().name, function(dependency){
        dependencyList.nextUnresolved().resolve(dependency);
        container.require_bean(name, callback, dependencyList);
    }, container.getDependencies(dependencyList.nextUnresolved().name));
    return true;
}

Container.prototype.handleAsynchronousReturn = function(name, dependencyList){
    if( dependencyList.has('$return') ){
        dependencyList.apply( this.beans[name].factory )
        return true;
    }
    return false;
}

Container.prototype.handleSynchronousReturn = function(name, callback, dependencyList){
    var bean = dependencyList.apply( this.beans[name].factory )
    this.saveResolvedBean(name, bean);
    callback(bean);
    return true;
}

Container.prototype.saveResolvedBean = function(name, bean){
    if( this.beans[name].scope === constants.SINGLETON ){
        this.resolvedBeans[name] = bean;
    }
}


Container.prototype.getDependencies = function( name ){
    if( this.beans[name].dependencies !== constants.RESOLVE ){
        return new DependencyList( this.beans[name].dependencies );
    }
    return new DependencyList( inspector.extractParameters(this.beans[name].factory) );
}

function validateBeanDef(beanDef){
    if( !beanDef ){
        throw Error('beanDef is invalid');
    }
    if( !beanDef.name ){
        throw Error('beanDef contains no name field');
    }
    if( !beanDef.factory ){
        throw Error('beanDef contains no factory field');
    }
    if( beanDef.dependencies && beanDef.dependencies.constructor !== Array && beanDef.dependencies !== constants.RESOLVE){
        throw Error('beanDef contains invalid dependencies field');
    }
    if( beanDef.scope && beanDef.scope !== constants.SINGLETON && beanDef.scope !== constants.PROTOTYPE){
        throw Error('beanDef contains invalid scope field');
    }
}


module.exports = Container;