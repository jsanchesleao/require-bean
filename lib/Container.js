"use strict";

var inspector = require('./inspector');
var naming = require('./namingConverter');

var Bean = require('./Bean');
var constants = require('./constants');

function Container(name){
    this.name = name;
    this.beans = {};
    this.resolvedBeans = {};
}

Container.prototype.register = function(name, factory){
    this.putBean({
        name: name,
        dependencies: constants.RESOLVE,
        factory: factory,
        scope: constants.SINGLETON
    });
};

Container.prototype.register_module = function(modulename){
    this.register(naming.toCamelCase(modulename), function(){
        return require(modulename);
    });
};

Container.prototype.register_proto = function(name, factory){
    this.putBean({
        name: name,
        dependencies: constants.RESOLVE,
        factory: factory,
        scope: constants.PROTOTYPE
    });
};

Container.prototype.bean = function(beanDef){
    validateBeanDef(beanDef);
    this.putBean( {
        name: beanDef.name,
        dependencies: beanDef.dependencies || constants.RESOLVE,
        factory: beanDef.factory,
        scope: beanDef.scope || constants.SINGLETON
    });
};

Container.prototype.putBean = function(config){
    if( config.name.charAt(0) === '$' ){
        throw new Error('Error registering bean ['+config.name+']: Beans with names beginning with $ are reserved and cannot be created by clients');
    }
    if( this.beans[config.name] ){
        throw new Error('Bean [' + config.name + '] is already registered');
    }
    this.beans[config.name] = new Bean({
        factory: config.factory,
        scope: config.scope,
        dependencyList: config.dependencies,
        name: config.name,
        container: this
    });
};

Container.prototype.run = function(bean, func){
    if( bean.constructor === String ){
        this.checkRegistered(bean);
        this.require_bean(bean, func);
    }
    else{
        var params = inspector.extractParameters(bean);
        this.checkRegistered(params[0]);
        this.require_bean(params[0], bean);
    }
};

Container.prototype.checkRegistered = function(name){
    if( !this.beans[name] ){
        throw Error('Bean is not registered');
    }
};

Container.prototype.require_bean = function(name, callback){
    this.checkRegistered(name);
    return this.getBean(name).resolve(callback)
};

Container.prototype.isInstantiated = function(beanName){
    return Boolean(this.resolvedBeans[beanName]);
};

Container.prototype.getInstantiatedBean = function(beanName){
    return this.resolvedBeans[beanName];
};

Container.prototype.getBean = function(beanName){
    return this.beans[beanName];
};

Container.prototype.saveResolvedBean = function(bean){
    if( bean.isSingleton() ){
        this.resolvedBeans[bean.name] = bean.object;
    }
};

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