exports.toCamelCase = function(name){
    return removeDots( removeHyphens(name) );
}

function removeHyphens(name){
    return splitAndCamelCase(name, '-');
}

function removeDots(name){
    return splitAndCamelCase(name, /\./);
}

function splitAndCamelCase(name, expr){
    var words = name.split(expr);
    var converted = words.shift();
    words.forEach(function(word){
        converted += word.charAt(0).toUpperCase() + word.slice(1);
    });
    return converted;
}