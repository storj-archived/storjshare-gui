"use strict";

var app = require("app");

app.on("ready", function () {
  var BrowserWindow = require("browser-window");

  var mainWindow = new BrowserWindow({
    width: 100,
    height: 100,
    show: false,
  });
  mainWindow.loadUrl("file://" + __dirname + "/index.html");
});
