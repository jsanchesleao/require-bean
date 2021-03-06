var requireBean = require('../');

var app = requireBean.container('app');

app.use( requireBean.debuggerInterceptor() );

var asyncBean = {
    name: 'asynchronous',
    factory: function($return){
        setTimeout(function(){
            $return({value: "ok"})
        }, 1000);
    }
}

app.bean(asyncBean);

app.run(function(asynchronous){
    console.log( asynchronous.value );
}, function(err){
    console.log(err);
});