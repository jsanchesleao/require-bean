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
}

Container.prototype.run = function(beanName, func){
    if( beanName.constructor === String ){
        this.require_bean(beanName, func);
    }
    else{
        var func = beanName;
        var params = inspector.extractParameters(func);
        this.require_bean(params[0], func);
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
    var requireBean = this;
    if( this.resolvedBeans[name] ){
        return callback(this.resolvedBeans[name]);
    }
    if( !this.beans[name] ){
        throw Error('Bean is not registered');
    }

    dependencyList = dependencyList || this.getDependencies(name);


    if( dependencyList.resolved ){
        if( dependencyList.has('$return') ){
            dependencyList.apply( requireBean.beans[name].factory )
        }
        else{
            var bean = dependencyList.apply( requireBean.beans[name].factory )
            requireBean.saveResolvedBean(name, bean);
            callback(bean);
        }
    }
    else{
        if( dependencyList.nextUnresolved().is('$return') ){
            dependencyList.nextUnresolved().resolve(function(bean){
                requireBean.saveResolvedBean(name, bean);
                callback(bean);
            })

            requireBean.require_bean(name, callback, dependencyList);
        }
        else{
            try{
                requireBean.require_bean(dependencyList.nextUnresolved().name, function(dependency){
                    dependencyList.nextUnresolved().resolve(dependency);
                    requireBean.require_bean(name, callback, dependencyList);
                });
            }
            catch(err){
                throw Error('Cannot wire bean ['+name+']. Unresolved dependency: ['+dependencyList.nextUnresolved().name+']');
            }
        }

    }
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