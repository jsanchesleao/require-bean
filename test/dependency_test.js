"use strict";

var Dependency = require('../lib/Dependency');
var assert = require('assert')

describe('Dependency', function(){
    it('accepts a name and initializes unresolved', function(){
        var dependency = new Dependency('name');
        assert.equal( dependency.name, 'name' );
        assert.ok( !dependency.resolved )
    });

    it('checks its name', function(){
        var dependency = new Dependency('name');
        assert.ok( dependency.is('name'))
    });

    it('accepts a bean and becomes resolved', function(){
        var dependency = new Dependency('name');
        dependency.resolve('value');

        assert.ok( dependency.resolved );
        assert.equal( dependency.bean, 'value');
    });
})