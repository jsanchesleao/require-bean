var inspector = require('../lib/inspector')
var assert = require('assert')

describe('The Inspector', function(){
    describe('#extractParameters()', function(){
        it('returns an array of parameter names for a given function', function(){
            var f = function(foo, bar){}
            var params = inspector.extractParameters(f)
            assert.equal( 'foo', params[0] )
            assert.equal( 'bar', params[1] )
        })

        it('returns empty array if function has no parameters', function(){
            var f = function(){}
            var params = inspector.extractParameters(f)

            assert.equal( 0, params.length )
        })

        it('works even if there are comments in the function definition', function(){
            var f = function(foo /*foo arg*/, bar /*bar arg*/){}
            var params = inspector.extractParameters(f)
            assert.equal( 'foo', params[0] )
            assert.equal( 'bar', params[1] )
        })

        it('also works with named functions', function(){
            var f = function foo(bar){}
            var params = inspector.extractParameters(f)
            assert.equal('bar', params[0])
        })

        it('throws exception if passed a non function argument', function(){
            var not_a_function = ""
            try{
                inspector.extractParameters(not_a_function)
                throw 'error'
            }catch(e){
                assert.equal('argument passed is not a function', e.message)
            }
        })
    })
})