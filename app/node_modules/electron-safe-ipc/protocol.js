"use strict";

var url = require("url");
var qs = require("querystring");

if (typeof window === "object") {
  var remote = require("remote");
  var protocol = remote.require("protocol");
} else {
  var protocol = require("protocol");
}

module.exports = {
  // FIXME: does not work in second registration
  register: function (ipc) {
    protocol.registerStringProtocol("electron-safe-ipc", function (request) {
      // nextTick workaround to prevent crash on exception
      process.nextTick(function () {
        var urlContents = url.parse(request.url);
        var queries = qs.parse(urlContents.query);

        var channel = queries.channel;
        var args = JSON.parse(queries.argsJson);

        ipc.emit.apply(ipc, [channel].concat(args));
      });
      return "";
    });
  }
};
