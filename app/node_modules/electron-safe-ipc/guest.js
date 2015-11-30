"use strict";

var EventEmitter = require("events").EventEmitter;
var qs = require("querystring");
var arraySlice = Array.prototype.slice;

var ipc = new EventEmitter();

ipc.send = function () {
  var channel = arguments[0];
  var args = arraySlice.call(arguments, 1);

  var req = new XMLHttpRequest();
  var query = qs.stringify({
    channel: channel,
    argsJson: JSON.stringify(args),
  });
  req.open("GET", "electron-safe-ipc:///message?" + query);
  req.send();
}

window.__electronSafeIpc = function (name, argsJson) {
  process.nextTick(function () {
    var args = JSON.parse(argsJson);
    ipc.emit.apply(ipc, [name].concat(args));
  });
};

require("./request")(ipc);

module.exports = ipc;
