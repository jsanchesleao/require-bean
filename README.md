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


QuickStart
----------

Follow the commented example:

```javascript
/*Instantiate the container*/
var container = require('require-bean');

/*Define a bean that takes no dependency*/
var logger = function(){
    return {
        info: function(x){
            console.log(x)
        }
    }
}

/*
    Define a bean that depends on logger
    The dependency is passed as an argument to the bean function
*/
var greeter = function(logger){
    return function(){
        logger.info("Hello World")
    }
}

/*Register the beans*/
container.register('logger', logger);
container.register('greeter', greeter);

/*Require a wired bean from the container*/
var app = container.require_bean('greeter');

app() //This instance will run with the 'logger' dependency properly wired
```

Dependency Management
---------------------

Since the beans are functions that return values, the dependencies are managed as these functions' arguments.
***require-bean*** will look in the named parameters for dependencies, so if you have a bean named _awesomebean_ and need it as a dependency, you could write this:

```javascript
container.register('mybean', function(awesomebean){ /* cool stuff here */ })
```

In order to do the correct wiring, the argument _name_ must match the bean name. If no bean with that name have been registered, an exception will be thrown.

There is no restriction for the name of the beans you want to register, but they will be useless if you cannot define a function argument with the same name.

Bean Scope
----------

When you register a bean, you can choose one of these methods:

* container.register( bean_name, bean_function )

This method registers the bean as a singleton, meaning that every time you request it, the same instance will be returned to you

* container.register_proto( bean_name, bean_function )

Registers the bean as a template for creating beans, meaning that each time you request it, a different instance will be returned


Circular Dependencies
---------------------

Since all dependencies are injected during creation of beans, not by setting properties, there is no support for circular dependencies in require-bean just yet.