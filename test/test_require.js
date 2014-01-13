/**
 * Created by jeferson on 1/13/14.
 */
var assert = require('assert')
var container = require('../lib/main')

var abean = function(){
    return {value: "BEAN"}
}
var abean_dependent = function(abean){
    return {value: abean.value}
}

var unresolved = function(somebean){}

container.register('abean', abean )
container.register('abean_dependent', abean_dependent )
container.register('unresolved', unresolved)

describe('The Container', function(){
    describe('#require_bean()', function(){
        it('returns a bean that has been registered', function(){
            var abean = container.require_bean('abean')
            assert.equal( 'BEAN', abean.value)
        })

        it('returns a wired bean', function(){
            var dependent = container.require_bean('abean_dependent')
            assert.equal('BEAN', dependent.value)
        })

        it('fails if required bean cannot be resolved', function(){
            try{
                var unresolved = container.require_bean('unresolved')
                throw 'fail'
            }
            catch(e){
                assert.equal('Cannot wire bean [unresolved]. Unresolved dependency: [somebean]', e)
            }
        })
    })
})
