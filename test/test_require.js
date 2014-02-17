/**
 * Created by jeferson on 1/13/14.
 */
var assert = require('assert')
var container = require('../lib/main').container('test');

var abean = function(){
    return {value: "BEAN"}
}

var otherBean = function(){
    return {value: "OTHERBEAN"}
}

var abean_dependent = function(abean){
    return {value: abean.value}
}
var unresolved = function(somebean){}
var proto = function(){
    return function(){}
}

var formatBean = {
    name: 'formatBean',
    factory: function(abean){
        return {value: abean.value}
    },
    dependencies: ['otherBean']
}

container.register('abean', abean );
container.register('otherBean', otherBean );
container.register('abean_dependent', abean_dependent );
container.register('unresolved', unresolved);
container.register_proto('proto', proto);

container.bean(formatBean);


describe('The Container', function(){
    describe('#require_bean()', function(){
        it('returns a bean that has been registered', function(){
            var abean = container.require_bean('abean');
            assert.equal( 'BEAN', abean.value)
        });

        it('returns a wired bean', function(){
            var dependent = container.require_bean('abean_dependent');
            assert.equal('BEAN', dependent.value)
        });

        it('returns a bean registered in bean notation', function(){
            var formatBean = container.require_bean('formatBean');
            assert.equal('OTHERBEAN', formatBean.value);
        })

        it('fails if required bean cannot be resolved', function(){
            try{
                var unresolved = container.require_bean('unresolved');
                throw Error('fail');
            }
            catch(e){
                assert.equal('Cannot wire bean [unresolved]. Unresolved dependency: [somebean]', e.message)
            }
        });

        it('returns singleton instances of beans', function(){
            var first = container.require_bean('abean');
            var last = container.require_bean('abean');
            assert.equal( first, last );
        });

        it('throws error if try to duplicate a bean name', function(){
            try{
                container.register('abean', function(){});
                assert.fail();
            }
            catch(e){
                assert.equal('Bean [abean] is already registered', e.message)
            }
        });

        it('returns different instances of prototype beans', function(){
            var first = container.require_bean('proto');
            var last  = container.require_bean('proto');
            assert.notEqual(first, last);
        });


    })
})
