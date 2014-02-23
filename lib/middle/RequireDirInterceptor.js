var Interceptor  = require('./Interceptor'),
    requireDir  = require('require-dir'),
    util = require('util');

function RequireDirInterceptor(){
}

util.inherits(RequireDirInterceptor, Interceptor);

RequireDirInterceptor.prototype.bind = function(app){
    this.app = app;
};

RequireDirInterceptor.prototype.doRegisterPhase = function(beanDef){
    if( beanDef.dir ){
        this.register( beanDef.dir );
        return false;
    }
    return true;
};

RequireDirInterceptor.prototype.register = function(dir){
    if( dir.constructor === Array ){
        for( var i = 0; i<dir.length; i++ ){
            this.registerAll( requireDir(dir[i], {recurse: true}) );
        }
    }
    else{
        this.registerAll( requireDir(dir, {recurse: true}) );
    }
};

RequireDirInterceptor.prototype.registerAll = function(dir){
    for( var i in dir ){
        if( this.isBean( dir[i] ) ){
            this.app.bean( dir[i] );
        }
        else{
            this.registerAll( dir[i] );
        }
    }
};

RequireDirInterceptor.prototype.isBean = function( beanDef ){
    return Boolean( beanDef.name && beanDef.factory );
};

module.exports = function(){ return new RequireDirInterceptor() };