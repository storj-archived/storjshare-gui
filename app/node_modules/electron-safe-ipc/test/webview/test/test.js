"use strict";

var assert = require("chai").assert;
var ipc = require("../../../host-webview");

describe("ipc", function () {
  it("echoes back", function (done) {
    var arg1 = 1;
    var arg2 = 2;
    ipc.on("fromRenderer", function(a1, a2) {
      assert.equal(a1, arg1);
      assert.equal(a2, arg2);
      done();
    });
    ipc.send("fromMain", arg1, arg2);
  });
});
