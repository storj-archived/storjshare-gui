Contributing
============

Greetings, hacker! Thanks for you interest in contributing to Storj Share!
Before you get started, we have a few guidelines relating to style and coding
conventions.

Contributor License Agreement
-----------------------------

By submitting pull requests, you agree that your work may be licensed under GNU Affero General Public License Version 3 (or later).
You also assert that you have completed the [Contributor License Agreement](https://storj.io/cla).

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

Submitting Pull Requests
------------------------

If you are making non-trivial changes or have a long-running branch, be sure to
go ahead and open a pull request and prefix the title with `[WIP]` to indicate
that it is a work-in-progress. This will allow others to provide feedback while
you are working and reduce the burden of reviewing large changes all at once.

Be sure to include sufficient test coverage for your work.

Pull Requests for Swag
----------------------
We love pull requests, so to encourage more of them we are offering
awesome swag. Only SIGNIFICANT pull requests count. Fixing a comma
doesn’t count, but fixing a bug, adding more test coverage, or writing
guides & documentation does.

- Make 1x pull requests to get into the contributors list and website
- Make 2x pull requests, we will send you a packet of stickers
- Make 5x pull requests, and we will send you a t-shirt and more stickers
- Make 10x pull requests, and you get a job interview with James + other swag

If we miss a milestones (probably because we are working hard), just let
us know so we can get you your swag. 

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
