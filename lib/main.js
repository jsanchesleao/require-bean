/**
 * Created by jeferson on 1/13/14.
 */
var inspector = require('./inspector');
var beans = {};

exports.register = function(name, beanfunc){
    beans[name] = beanfunc
}

function require_bean(name){
    var dependencies = getDependenciesNames(name)

    var injections = dependencies.map(function(dependency){
        return require_bean(dependency)
    })

    return beans[name].apply(this, injections)
}

function getDependenciesNames( name ){
    var dependencies = inspector.extractParameters(beans[name]);
    dependencies.forEach(function(dependency){
        if( !beans[dependency] ){
            throw 'Cannot wire bean [' + name + ']. Unresolved dependency: [' + dependency + ']';
        }
    })
    return dependencies
}

exports.require_bean = require_bean;