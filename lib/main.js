/**
 * Created by jeferson on 1/13/14.
 */
var inspector = require('./inspector');
var beans = {};
var resolvedBeans = {};

var PROTOTYPE = 'PROTOTYPE';
var SINGLETON = 'SINGLETON';

exports.register = function(name, beanfunc){
    beans[name] = {bean: beanfunc, scope: SINGLETON}
}

exports.register_proto = function(name, beanfunc){
    beans[name] = {bean: beanfunc, scope: PROTOTYPE}
}

function require_bean(name){
    if( resolvedBeans[name] ){
        return resolvedBeans[name]
    }
    var dependencies = getDependenciesNames(name)

    var injections = dependencies.map(function(dependency){
        return require_bean(dependency)
    })

    var bean = beans[name].bean.apply(this, injections);

    if( beans[name].scope === SINGLETON ){
        resolvedBeans[name] = bean;
    }
    return bean;
}

function getDependenciesNames( name ){
    var dependencies = inspector.extractParameters(beans[name].bean);
    dependencies.forEach(function(dependency){
        if( !beans[dependency] ){
            throw 'Cannot wire bean [' + name + ']. Unresolved dependency: [' + dependency + ']';
        }
    })
    return dependencies
}

function allBeansAreSingletons(dependencies){
    dependencies.forEach(function(dependency){
        if(beans[dependency] && beans[dependency].scope !== SINGLETON){
            return false;
        }
    })
    return true
}

exports.require_bean = require_bean;