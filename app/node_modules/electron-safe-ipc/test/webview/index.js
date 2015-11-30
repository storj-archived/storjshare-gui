"use strict";

var path = require("path");
var Mocha = require("mocha");
var app = require("remote").require("app");

document.addEventListener("DOMContentLoaded", function () {
  var mocha = new Mocha();
  mocha.addFile(path.join(__dirname, "test/test.js"));
  mocha.run(function (failures) {
    // TODO: return status
    app.quit();
  });
});
