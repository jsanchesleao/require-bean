var app = require('../').container('app');
var LoggerInterceptor = require('../lib/middle/LoggerInterceptor');

app.interceptorChain.push( new LoggerInterceptor() );

app.bean({
    name: 'Logger',
    factory: function(){
        return function(text){ console.log(text) };
    }
});

app.bean({
    name: 'hello',
    dependencies: ['Logger'],
    factory: function(Logger){
        return function(){ Logger('Hello World') };
    }
});

app.run(function(hello){
    hello();
});
