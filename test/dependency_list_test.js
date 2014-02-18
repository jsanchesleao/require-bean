"use strict";

var DependencyList = require('../lib/DependencyList');
var Dependency = require('../lib/Dependency');
var assert = require('assert')

describe('DependencyList', function(){
    it('can be initialized with an array, making all dependencies unresolved', function(){
        var list = new DependencyList(['bla', 'ble']);

        assert.equal( list.dependencies[0].name, 'bla' );
        assert.ok( !list.dependencies[0].resolved );
        assert.equal( list.dependencies[1].name, 'ble' );
        assert.ok( !list.dependencies[0].resolved );
    });

    it('looks for unresolved dependencies', function(){
        var list = new DependencyList();
        list.add( createDependency('bla', true) )
        list.add( createDependency('ble', true) )
        list.add( createDependency('bli', true) )

        assert.ok( list.resolved );

        list.add( createDependency('blu', false) )
        assert.ok( !list.resolved );
    });

    it('looks for special named dependency', function(){
        var list = new DependencyList();
        list.add( createDependency('bla', true) )

        assert.ok( list.has('bla') )
        assert.ok( !list.has('ble') )
    });

    it('applies itself to a function', function(done){
        var list = new DependencyList();
        list.add( createDependency('bla', true, 'VALUE1') );
        list.add( createDependency('ble', true, 'VALUE2') );
        var f = function(value1, value2){
            assert.equal(value1, 'VALUE1');
            assert.equal(value2, 'VALUE2');
            done();
        }
        list.apply(f);
    });

    it('shows next unresolved dependency', function(){
        var list = new DependencyList();
        list.add( createDependency('bla', true) );
        list.add( createDependency('ble', false) );

        assert.equal( list.nextUnresolved().name, 'ble' );
    });

})


function createDependency(name, resolved, bean){
    var dependency = new Dependency(name);
    if(resolved){
        dependency.resolve(bean || 'bean');
    }
    return dependency;
}