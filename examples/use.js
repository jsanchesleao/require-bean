var app = require('./.').container('app');

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

app.run('hello', function(hello){
    hello();
});
