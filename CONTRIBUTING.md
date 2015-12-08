Contributing
============

Greetings, hacker! Thanks for you interest in contributing to DriveShare!
Before you get started, we have a few guidelines relating to style and coding
conventions.

Style Guide
-----------

Please read and follow
[Felix's Node.js Style Guide](https://github.com/felixge/node-style-guide).

There is an included `.jshintrc` file in this repository so you can make sure
your code follows the rules. Most editors support real-time checking using this
file.

* [Vim](https://github.com/walm/jshint.vim)
* [Atom](https://atom.io/packages/atom-jshint)

Inline Documentation
--------------------

Please make use of [JSDoc](http://usejsdoc.org/) style comments for modules.
You can crack open any file in `app/lib` to see examples.

Automated Testing
-----------------



Submitting Pull Requests
------------------------

If you are making non-trivial changes or have a long-running branch, be sure to
go ahead and open a pull request and prefix the title with `[WIP]` to indicate
that it is a work-in-progress. This will allow others to provide feedback while
you are working and reduce the burden of reviewing large changes all at once.

Be sure to include sufficient test coverage for your work.

Project Structure & Patterns
----------------------------

New features should be composed as a new module placed in `lib/` and expose a
constructor that can be instantiated in `lib/views.js`. If your module needs to
be exposed as a singleton, author it as a constructor, then export an instance.
Be sure to also export the constructor, like so:

```js
function SomeClass() {
  this._shouldBeSingleton = true;
}

module.exports = new SomeClass();
module.exports.SomeClass = SomeClass;
```

Also, for consistency's sake, constructors should have the ability to be
instantiated with or without the `new` keyword. You can do this easily by
adding the following to your constructor function.

```js
function SomeClass() {
  if (!(this instanceof SomeClass)) {
    return new SomeClass();
  }
  // ...
}
```

Please designate "private" members and methods by prepending an underscore to
it's name. This does not affect the execution of the code, but does indicate
intent. If a method or property should not be modified or called by
implementors, it's "private". For instance:

```js
SomeClass.prototype._say = function(text) {
  console.log(text);
};

SomeClass.prototype.sayHello = function() {
  this._say('hello');
};
```

Most importantly, **have fun and be excellent to each other**!

---

![HACK THE PLANET](https://i.giphy.com/14kdiJUblbWBXy.gif)
