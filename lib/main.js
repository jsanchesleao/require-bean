/**
 * Created by jeferson on 1/13/14.
 */
var inspector = require('./inspector');

var PROTOTYPE = 'PROTOTYPE';
var SINGLETON = 'SINGLETON';
var containers = {};

function Container(name){
    this.name = name;
    this.beans = {};
    this.resolvedBeans = {};
}

Container.prototype.register = function(name, beanfunc){
    this.beans[name] = {bean: beanfunc, scope: SINGLETON}
}

Container.prototype.register_module = function(modulename){
    this.register(modulename, function(){
        return require(modulename);
    });
}


Container.prototype.register_proto = function(name, beanfunc){
    this.beans[name] = {bean: beanfunc, scope: PROTOTYPE}
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

    var bean = this.beans[name].bean.apply(this, injections);

    if( this.beans[name].scope === SINGLETON ){
        this.resolvedBeans[name] = bean;
    }
    return bean;
}

Container.prototype.getDependenciesNames = function( name ){
    var dependencies = inspector.extractParameters(this.beans[name].bean);
    var self = this;
    dependencies.forEach(function(dependency){
        if( !self.beans[dependency] ){
            throw 'Cannot wire bean [' + name + ']. Unresolved dependency: [' + dependency + ']';
        }
    })
    return dependencies
}

exports.container = function(name){
    if( !containers[name] ){
        containers[name] = new Container(name);
    }
    return containers[name];
}
