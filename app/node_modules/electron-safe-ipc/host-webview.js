"use strict";

var EventEmitter = require("events").EventEmitter;
var arraySlice = Array.prototype.slice;
var arrayForEach = Array.prototype.forEach;

var ipc = new EventEmitter();
require("./protocol").register(ipc);

ipc.send = function() {
  var channel = arguments[0];
  var args = arraySlice.call(arguments, 1);

  arrayForEach.call(document.querySelectorAll("webview"), function (webview) {
    var script = "window.__electronSafeIpc && window.__electronSafeIpc("
      + JSON.stringify(channel) + ","
      + JSON.stringify(JSON.stringify(args))
      + ");";
    webview.executeJavaScript(script);
  });
};

require("./request")(ipc);

module.exports = ipc;
