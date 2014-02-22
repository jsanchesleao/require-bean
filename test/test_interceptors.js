var Chain = require('../lib/middle/Chain');
var Interceptor = require('../lib/middle/Interceptor');
var assert = require('assert');

describe('Chains', function(){
    it('accepts Interceptors and combines their registerPhase', function(){
        var count = 0;
        var chain = new Chain();
        var _beanDef = 'BEANDEF';
        chain.push(new Interceptor({
            registerPhase: function(beanDef){
                assert.equal(count, 0);
                assert.equal('BEANDEF', beanDef);
                count = 1;
                return true;
            }
        }));

        chain.push(new Interceptor({
            registerPhase: function(beanDef){
                assert.equal(count, 1);
                assert.equal('BEANDEF', beanDef);
                count = 2;
                return false;
            }
        }));

        chain.push(new Interceptor({
            registerPhase: function(beanDef){
                assert.fail();
                return true;
            }
        }));

        chain.registerPhase(_beanDef, function(){
            assert.fail();
        });
        assert.equal(count, 2);

    });

    it('accepts Interceptors and combines their preparePhase', function(done){
        var count = 0;
        var chain = new Chain();
        var _bean = "ABEAN";
        chain.push(new Interceptor({
            preparePhase: function(bean, callback, next){
                assert.equal(count, 0);
                assert.equal(bean, _bean);
                count = 1;
                next(null, bean, callback);
            }
        }));

        chain.push(new Interceptor({
            preparePhase: function(bean, callback, next){
                assert.equal(count, 1);
                assert.equal(bean, _bean);
                count = 2;
                next(null, bean, callback);
            }
        }));

        chain.preparePhase(_bean, function(){}, function(){
            done();
        })

    })

    it('accepts Interceptors and combines their resolvePhase', function(done){
        var count = 0;
        var chain = new Chain();
        var _bean = "ABEAN";
        chain.push(new Interceptor({
            resolvePhase: function(bean, callback, next){
                assert.equal(count, 0);
                assert.equal(bean, _bean);
                count = 1;
                next(null, bean, callback);
            }
        }));

        chain.push(new Interceptor({
            resolvePhase: function(bean, callback, next){
                assert.equal(count, 1);
                assert.equal(bean, _bean);
                count = 2;
                next(null, bean, callback);
            }
        }));

        chain.resolvePhase(_bean, function(){}, function(){
            done();
        })

    });

    it('accepts Interceptors and combines their instantiationPhase', function(done){
        var count = 0;
        var chain = new Chain();
        var _bean = "ABEAN";
        chain.push(new Interceptor({
            instantiationPhase: function(bean, callback, next){
                assert.equal(count, 0);
                assert.equal(bean, _bean);
                count = 1;
                next(null, bean, callback);
            }
        }));

        chain.push(new Interceptor({
            instantiationPhase: function(bean, callback, next){
                assert.equal(count, 1);
                assert.equal(bean, _bean);
                count = 2;
                next(null, bean, callback);
            }
        }));

        chain.instantiationPhase(_bean, function(){}, function(){
            done();
        })

    })

});