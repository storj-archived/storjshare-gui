"use strict";

var assert = require("chai").assert;
var mainWindow = require("../mainWindow");
var ipc = require("../../../host");

describe("mainWindow title", function () {
  it("is Test", function () {
    assert.equal(mainWindow.getTitle(), "Test");
  });
});

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

describe("request", function () {
  it("make inter-process request with Promise", function (done) {
    var arg1 = 1;
    var arg2 = 2;
    ipc.respond("requestFromRenderer", function (a1, a2) {
      return a1 + a2;
    });
    ipc.request("requestFromMain", arg1, arg2).then(function (result) {
      assert.equal(result, 4);
      done();
    });
  });
});
