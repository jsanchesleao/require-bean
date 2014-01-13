/**
 * Created by jeferson on 1/13/14.
 */

var ARGUMENTS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

exports.extractParameters = function(fn){

    if( !isFunction(fn) ){
        throwError()
    }

    var result = fn.toString().replace(COMMENTS, '').match(ARGUMENTS)[1].split(/,/)

    var args = result.map(function(value){
        return value.trim()
    })

    if( args.length == 1 && args[0] === ""){
        return []
    }

    return args
}

function isFunction(f){
    return !!(f && f.constructor && f.call && f.apply);
}


function throwError(){
    throw 'argument passed is not a function'
}