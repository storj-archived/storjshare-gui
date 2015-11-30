"use strict";

var EventEmitter = require("events").EventEmitter;
var BrowserWindow = require("browser-window");
var arraySlice = Array.prototype.slice;

var ipc = new EventEmitter();
require("./protocol").register(ipc);

ipc.send = function() {
  var channel = arguments[0];
  var args = arraySlice.call(arguments, 1);

  BrowserWindow.getAllWindows().forEach(function (window) {
    var script = "window.__electronSafeIpc && window.__electronSafeIpc("
      + JSON.stringify(channel) + ","
      + JSON.stringify(JSON.stringify(args))
      + ");";
    window.webContents.executeJavaScript(script);
  });
};

require("./request")(ipc);

module.exports = ipc;
