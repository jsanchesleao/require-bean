/**
 * Created by jeferson on 1/13/14.
 */
var inspector = require('./inspector');
var naming = require('./namingConverter');

var containers = {};

var SINGLETON = 'SINGLETON';
var RESOLVE = 'RESOLVE';
var PROTOTYPE = 'PROTOTYPE';

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

Container.prototype.register = function(name, factory){
    this.putBean({
        name: name,
        dependencies: RESOLVE,
        factory: factory,
        scope: SINGLETON
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
        dependencies: beanDef.dependencies || RESOLVE,
        factory: beanDef.factory,
        scope: beanDef.scope || SINGLETON
    });
}


Container.prototype.register_proto = function(name, factory){
    this.putBean({
        name: name,
        dependencies: RESOLVE,
        factory: factory,
        scope: PROTOTYPE
    });
}

Container.prototype.require_bean = function(name){
    if( this.resolvedBeans[name] ){
        return this.resolvedBeans[name]
    }
    var dependencies = this.getDependenciesNames(name)

    var self = this;
    var injections = dependencies.map(function(dependency){
        return self.require_bean(dependency)
    })

    var bean = this.beans[name].factory.apply(this, injections);

    if( this.beans[name].scope === SINGLETON ){
        this.resolvedBeans[name] = bean;
    }
    return bean;
}

Container.prototype.getDependenciesNames = function( name ){
    if( this.beans[name].dependencies !== RESOLVE ){
        return this.beans[name].dependencies;
    }
    var dependencies = inspector.extractParameters(this.beans[name].factory);
    var self = this;
    dependencies.forEach(function(dependency){
        if( !self.beans[dependency] ){
            throw Error('Cannot wire bean [' + name + ']. Unresolved dependency: [' + dependency + ']');
        }
    })
    return dependencies
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
    if( beanDef.dependencies && beanDef.dependencies.constructor !== Array && beanDef.dependencies !== RESOLVE){
        throw Error('beanDef contains invalid dependencies field');
    }
    if( beanDef.scope && beanDef.scope !== SINGLETON && beanDef.scope !== PROTOTYPE){
        throw Error('beanDef contains invalid scope field');
    }
}

exports.container = function(name){
    if( !containers[name] ){
        containers[name] = new Container(name);
    }
    return containers[name];
}

    exports.SINGLETON = SINGLETON;
    exports.PROTOTYPE = PROTOTYPE;
    exports.RESOLVE   = RESOLVE;