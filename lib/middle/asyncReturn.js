"use strict;"
function AsyncReturn(){

}

AsyncReturn.prototype.registerPhase = function(beanName, beanDef, next){

}

AsyncReturn.prototype.resolvePhase = function(bean, callback, next){
    if( bean.dependencyList.nextUnresolved().is('$return') ){
        this.dependencyList.nextUnresolved().resolve(function(resolvedBean){
            bean.object = resolvedBean;
            bean.container.saveResolvedBean(bean);
            callback(null, resolvedBean);
        });
        bean.resolve(callback);
        next()
    } 
}

AsyncReturn.prototype.instantiationPhase = function(bean, callback, next){
	if( bean.dependencyList.has('$return') ){
        bean.dependencyList.apply( bean.container.getBean( bean.name ).factory );
        next();
    }    
}