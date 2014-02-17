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
/*
    Instantiate the container
    This line creates a container named 'myapp', to hold beans related to 'myapp' application
*/
var container = require('require-bean').container('myapp');

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

There is also a helper method to register other modules into the container:

```javascript
   container.register_module('fs');
```
This will register the module with the same name into the container as a dependency for other beans.
If the module's name contains hyphens or dots, it will be converted to a camelCase name:

```javascript
   container.register_module('token-manager'); //this will register a bean named tokenManager to hold the module.
```

Bean Notation
-------------

Alternatively you can use bean notation to register your beans. For that you should use the method <code>container.bean()</code> like the following:

```javascript
var bean = {
   name: 'myBean',
   dependencies: ['aDependency', 'otherDependency'],
   scope: container.SINGLETON,
   factory: function(a, b){
      return "awesomeness using beans " + a + " and " + b;
   }
}
```

This strict way to define a bean will accept an object with four fields:

- name

Required. This will be the name to be saved in the registry.

- dependencies

Optional. An array containing the names of the dependencies to be passed to factory. If instead you pass the constant <code>container.RESOLVE</code>, the container will infer from the names of the factory arguments.<br>
Default: <code>container.RESOLVE</code>

- scope

Optional. You can pass <code>container.SINGLETON</code> or <code>container.PROTOTYPE</code>, so that your bean will be placed correctly in the registry.<br>
Default: <code>container.SINGLETON</code>

- factory

Required. The function that will return your bean. It will take the dependencies as arguments, and they will be resolved based on the dependencies parameter defined earlier.

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

Notice that the singletons' scope is the enclosing container. Different container instances will have different singleton instances.

* container.register_proto( bean_name, bean_function )

Registers the bean as a template for creating beans, meaning that each time you request it, a different instance will be returned


Circular Dependencies
---------------------

Since all dependencies are injected during creation of beans, not by setting properties, there is no support for circular dependencies in require-bean just yet.


Multiple Containers
-------------------

```javascript
var requireBean = require('require-bean');

/*Creates a container named 'myapp'*/
var myappContainer = requireBean.container('myapp');

/*Creates a container named 'otherapp'*/
var otherAppContainer = requireBean.container('otherapp');
```

requireBean.container() method is called to create containers. Beans that are registered in one container will NOT be available in the other container instances.
If your app starts other apps, you should consider create separated container instances for each app.
