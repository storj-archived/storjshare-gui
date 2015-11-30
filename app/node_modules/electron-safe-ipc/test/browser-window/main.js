"use strict";

var path = require("path");
var app = require("app");
var Mocha = require("mocha");

app.on("ready", function () {
  var mainWindow = require("./mainWindow");
  mainWindow.webContents.on("did-finish-load", function () {
    var mocha = new Mocha();
    mocha.addFile(path.join(__dirname, "test/test.js"));
    mocha.run(function (failures) {
      // TODO: return status
      app.quit();
    });
  });
});
