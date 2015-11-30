"use strict";
var BrowserWindow = require("browser-window");

var mainWindow = new BrowserWindow({
  width: 100,
  height: 100,
  show: false,
  "node-integration": false,
});
mainWindow.loadUrl("file://" + __dirname + "/index.html");

module.exports = mainWindow;
