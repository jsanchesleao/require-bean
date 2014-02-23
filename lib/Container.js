"use strict";

var inspector = require('./inspector');
var naming = require('./namingConverter');

var Bean = require('./Bean');
var constants = require('./constants');
var Chain = require('./middle/Chain');
var middleware = require('./middle/middleware');

function Container(name){
    Object.defineProperties(this, {
        name: {
            value: name,
            writable: false,
            configurable: false
        },
        beans: {
            value: {},
            configurable: false,
            enumerable: false
        },
        resolvedBeans: {
            value: {},
            configurable: false,
            enumerable: false
        },
        interceptorChain: {
            value: new Chain(),
            writable: false,
            enumerable: false
        }
    });

    this.interceptorChain.push( middleware.asyncReturn() );
}

Container.prototype.use = function(interceptor){
    interceptor.bind( this );
    this.interceptorChain.push(interceptor);
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
    if( modulename.charAt(0) === '.' ){
        throw Error('Error registering module ['+modulename+']: Cannot register relative path modules');
    }
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
    this.putBean( beanDef );
};

Container.prototype.putBean = function(beanDef){
    var container = this;
    this.interceptorChain.registerPhase(beanDef, function(){
        container.validateBeanDef(beanDef);
        container.beans[beanDef.name] = new Bean({
            factory: beanDef.factory,
            scope: beanDef.scope || constants.SINGLETON,
            dependencyList: beanDef.dependencies || constants.RESOLVE,
            name: beanDef.name,
            container: container
        });
    });
};

Container.prototype.run = function(bean, func, errFunc){
    if( bean.constructor === String ){
        this.checkRegistered(bean);
        this.require_bean(bean, func, errFunc);
    }
    else{
        var params = inspector.extractParameters(bean);
        this.checkRegistered(params[0]);
        this.require_bean(params[0], bean, func);
    }
};

Container.prototype.checkRegistered = function(name){
    if( !this.beans[name] ){
        throw Error('Bean ['+name+'] is not registered');
    }
};

Container.prototype.require_bean = function(name, callback, _errCallback){
    this.checkRegistered(name);
    var errCallback = _errCallback || function(err){ console.log(err) };
    return this.getBean(name).resolve(function(err, bean){
        if( err ){
            errCallback(err);
        }
        else{
            callback(bean);
        }
    })
};

Container.prototype.isInstantiated = function(beanName){
    return Boolean(this.resolvedBeans[beanName]);
};

Container.prototype.getInstantiatedBean = function(beanName){
    return this.resolvedBeans[beanName];
};

Container.prototype.getBean = function(beanName){
    if(this.beans[beanName]){
        return this.beans[beanName];
    }
    throw Error('Cannot find bean [' + beanName + ']');
};

Container.prototype.saveResolvedBean = function(bean){
    if( bean.isSingleton() ){
        this.resolvedBeans[bean.name] = bean.object;
    }
};

Container.prototype.validateBeanDef = function(beanDef){
    if( !beanDef ){
        throw Error('beanDef is invalid');
    }
    if( !beanDef.name ){
        throw Error('beanDef contains no name field');
    }
    if( !beanDef.factory ){
        throw Error('beanDef ['+beanDef.name+'] contains no factory field');
    }
    if( beanDef.dependencies && beanDef.dependencies.constructor !== Array && beanDef.dependencies !== constants.RESOLVE){
        throw Error('beanDef ['+beanDef.name+'] contains invalid dependencies field');
    }
    if( beanDef.scope && beanDef.scope !== constants.SINGLETON && beanDef.scope !== constants.PROTOTYPE){
        throw Error('beanDef ['+beanDef.name+'] contains invalid scope field');
    }
    if( beanDef.name.charAt(0) === '$' ){
        throw new Error('Error registering bean ['+beanDef.name+']: Beans with names beginning with $ are reserved and cannot be created by clients');
    }
    if( this.beans[beanDef.name] ){
        throw new Error('Bean [' + beanDef.name + '] is already registered');
    }
}


module.exports = Container;