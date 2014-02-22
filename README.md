Require Bean
============

This is a minimal IoC container, designed for simplicity. It's main concept is the container, in which the beans are registered.
A bean is just a function that returns a value, like the following:

```javascript
var mybean = function(){
    return {
        value: 'something'
        //anything here
    }
}
```


Installation
------------

```bash
npm install require-bean
```


Documentation
-------------

[http://jsanchesleao.github.io/require-bean/]