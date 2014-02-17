/**
 * Created by jeferson on 2/16/14.
 */
var naming = require('../lib/namingConverter');
var assert = require('assert');

describe('Naming', function(){
    it('Converts names with hyphens to camelCase', function(){
        assert.equal( naming.toCamelCase('some-wrong-name'), 'someWrongName');
    });

    it('Converts names with dots to camelCase', function(){
        assert.equal( naming.toCamelCase('some.wrong.name'), 'someWrongName');
    });

    it('Keeps unaltered names without dots and hyphens', function(){
        assert.equal( naming.toCamelCase('somename'), 'somename');
    });
})
