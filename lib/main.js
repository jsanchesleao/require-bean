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

Container.prototype.run = function(beanName, func){
    this.require_bean(beanName, func);
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

Container.prototype.require_bean = function(name, callback, dependencies, injections){
    var requireBean = this;

    if( this.resolvedBeans[name] ){
        return callback(null, this.resolvedBeans[name]);
    }
    if( !this.beans[name] ){
        return callback(Error('Bean is not registered'), null);
    }

    var checkedDependencies = dependencies || this.getDependenciesNames(name);
    var checkedInjections = injections || [];


    if( checkedDependencies.length === checkedInjections.length){
        if( hasAsyncDependency(checkedDependencies) ){
            requireBean.beans[name].factory.apply(requireBean, checkedInjections);
        }
        else{
            var bean = requireBean.beans[name].factory.apply(requireBean, checkedInjections);
            requireBean.saveResolvedBean(name, bean);
            callback(null, bean);
        }
        return;
    }
    else{
        var nextDependency = checkedDependencies[ checkedInjections.length ];
        if( nextDependency === '$return' ){
            checkedInjections.push( function(bean){
                requireBean.saveResolvedBean(name, bean);
                callback(null, bean);
            } );
            return requireBean.require_bean(name, callback, checkedDependencies, checkedInjections);
        }

        requireBean.require_bean(nextDependency, function(err, dependency){
            if(err){
                return callback(Error('Cannot wire bean ['+name+']. Unresolved dependency: ['+nextDependency+']'), null);
            }
            checkedInjections.push(dependency);

            return requireBean.require_bean(name, callback, checkedDependencies, checkedInjections);
        });
    }
}

function hasAsyncDependency(checkedDependencies){
    var result = false;
    checkedDependencies.forEach(function(dependency){
        if(dependency === '$return'){
            result = true;
        }
    });
    return result;
}

Container.prototype.saveResolvedBean = function(name, bean){
    if( this.beans[name].scope === SINGLETON ){
        this.resolvedBeans[name] = bean;
    }
}


Container.prototype.getDependenciesNames = function( name ){
    if( this.beans[name].dependencies !== RESOLVE ){
        return this.beans[name].dependencies;
    }
    return inspector.extractParameters(this.beans[name].factory);
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