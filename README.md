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
var app = require('require-bean').container('myapp');

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
app.register('logger', logger);
app.register('greeter', greeter);

/*Require a wired bean from the container*/
app.run(function(greeter){
    greeter(); //This instance will run with the 'logger' dependency properly wired
});
```

There is also a helper method to register other modules into the container:

```javascript
   app.register_module('fs');
```
This will register the module with the same name into the container as a dependency for other beans.
If the module's name contains hyphens or dots, it will be converted to a camelCase name:

```javascript
   app.register_module('token-manager'); //this will register a bean named tokenManager to hold the module.
```

Bean Notation
-------------

Alternatively, and preferably, you can use bean notation to register your beans. For that you should use the method <code>app.bean()</code> like the following:

```javascript
var beanDef = {
   name: 'myBean',
   dependencies: ['aDependency', 'otherDependency'],
   scope: app.SINGLETON,
   factory: function(a, b){
      return "my awesome beans using " + a + " and " + b;
   }
}
//This registers a bean named 'myBean', with two named dependencies ('aDependency' and 'otherDependency') and singleton scope
app.bean(beanDef);
```

If you pass a dependencies array to the definition, the names of the factory function arguments will be ignored, and the names in the array will be used, in the proper order.
If you omit the dependencies array or pass app.RESOLVE, the names of the arguments of factory function will be used.

This strict way to define a bean will accept an object with four fields:

- name

Required. This will be the name to be saved in the registry.

- dependencies

Optional. An array containing the names of the dependencies to be passed to factory. If instead you pass the constant <code>app.RESOLVE</code>, the container will infer from the names of the factory arguments.<br>
Default: <code>app.RESOLVE</code>

- scope

Optional. You can pass <code>container.SINGLETON</code> or <code>app.PROTOTYPE</code>, so that your bean will be placed correctly in the registry.<br>
Default: <code>app.SINGLETON</code>

- factory

Required. The function that will return your bean. It will take the dependencies as arguments, and they will be resolved based on the dependencies parameter defined earlier.


Asynchronous Beans
------------------

If your bean creation should be asynchronous, like registering a running http server, you need to wire the special dependency $return, provided by default:

```javascript
    app.register('server', function(http, $return){ //
        var server = http.createServer();
        server.listen(8000, function(){
            $return(server);  // registers the server asynchronously;
        });
    });
```


Dependency Management
---------------------

Since the beans are functions that return values, the dependencies are managed as these functions' arguments.
***require-bean*** will look in the named parameters for dependencies, so if you have a bean named _awesomebean_ and need it as a dependency, you could write this:

```javascript
app.register('mybean', function(awesomebean){ /* cool stuff here */ })
```

In order to do the correct wiring, the argument _name_ must match the bean name. If no bean with that name have been registered, an exception will be thrown.

There is no restriction for the name of the beans you want to register, but they will be useless if you cannot define a function argument with the same name.

If the bean was defined in Bean Notation, the dependencies will be resolved differently, by first looking at the dependencies array provided, and using the function arguments as a fallback.

Bean Scope
----------

When you register a bean, you can choose one of these methods:

* app.register( bean_name, bean_function )

This method registers the bean as a singleton, meaning that every time you request it, the same instance will be returned to you

Notice that the singletons' scope is the enclosing container. Different container instances will have different singleton instances.

* app.register_proto( bean_name, bean_function )

Registers the bean as a template for creating beans, meaning that each time you request it, a different instance will be returned


In bean notation, you should pass a scope attribute with the value <code>app.PROTOTYPE</code> to use prototype scope. The default scope is <code>app.SINGLETON</code>.


Circular Dependencies
---------------------

Since all dependencies are injected during creation of beans, not by setting properties, there is no support for circular dependencies in require-bean just yet.


Multiple Containers
-------------------

```javascript
var requireBean = require('require-bean');

/*Creates a container named 'myapp'*/
var myApp = requireBean.container('myApp');

/*Creates a container named 'otherapp'*/
var otherApp = requireBean.container('otherApp');
```

requireBean.container() method is called to create containers. Beans that are registered in one container will NOT be available in the other container instances.
If your app starts other apps, you should consider create separated container instances for each app.
