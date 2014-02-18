var assert = require('assert')
var app = require('../lib/main').container('test');

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

var asyncBean = {
    name: 'asyncBean',
    dependencies: ['$return'],
    factory: function($return){
        setTimeout(function(){
            $return({value: 'async'});
        }, 10)
    }
}

app.register('abean', abean );
app.register('otherBean', otherBean );
app.register('abean_dependent', abean_dependent );
app.register('unresolved', unresolved);
app.register_proto('proto', proto);

app.bean(formatBean);
app.bean(asyncBean);


describe('The Container', function(){
    describe('#require_bean()', function(){
        it('returns a bean that has been registered', function(done){
            app.run('abean', function(abean){
                assert.equal( abean.value, 'BEAN');
                done();
            });
        });

        it('returns a bean that has been registered using short notation', function(done){
            app.run(function(abean){
                assert.equal( abean.value, 'BEAN');
                done();
            });
        });

        it('returns a wired bean', function(done){
            app.run('abean_dependent', function(dependent){
                assert.equal(dependent.value, 'BEAN');
                done();
            });
        });

        it('returns a bean registered in bean notation', function(done){
            app.run('formatBean', function(formatBean){
                assert.equal(formatBean.value, 'OTHERBEAN');
                done();
            });
        });

        it('returns a bean registered in asynchronous bean notation', function(done){
            app.run('asyncBean', function(asyncBean){
                assert.equal(asyncBean.value, 'async');
                done();
            });
        });

        it('fails if required bean cannot be resolved', function(){
            try{
                var unresolved = app.run('unresolved', function(unresolved){
                    assert.fail();
                });
            }
            catch(err){
                assert.equal(err.message, 'Cannot wire bean [unresolved]. Unresolved dependency: [somebean]');
            }
        });

        it('returns singleton instances of beans', function(done){
            app.run('abean', function(first){
                app.run('abean', function(last){
                    assert.equal( first, last );
                    done();
                })
            });
        });

        it('returns error if try to duplicate a bean name', function(){
            try{
                app.register('abean', function(){});
                assert.fail();
            }
            catch(e){
                assert.equal(e.message, 'Bean [abean] is already registered')
            }
        });

        it('returns different instances of prototype beans', function(done){
            app.run('proto', function(first){
                app.run('proto', function(last){
                    assert.notEqual(first, last);
                    done();
                });
            });
        });
    })
})
