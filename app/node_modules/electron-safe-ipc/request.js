"use strict";

module.exports = function (ipc) {

  ipc.responders = {};

  ipc.respond = function(name, func) {
    if (name in ipc.responders) {
      throw new Error("responder " + name + " already registered");
    }
    ipc.responders[name] = func;
  }

  ipc.on("electronSafeIpc:request", function(name, args) {
    try {
      var responder = ipc.responders[name];
      if (!responder) {
        throw new Error("responder not found for " + name);
      }
      var result = Promise.resolve(responder.apply(undefined, args));
      result
        .then(function (res) {
          ipc.send("electronSafeIpc:respond:" + name, true, res);
        })
        .catch(function (err) {
          ipc.send("electronSafeIpc:respond:" + name, false, String(err));
        });
    } catch (error) {
      ipc.send("electronSafeIpc:respond:" + name, false, String(error));
    }
  });

  ipc.request = function() {
    var requestArgs = [].slice.call(arguments);
    return new Promise(function (resolve, reject) {
      try {
        var name = requestArgs[0];
        var args = requestArgs.slice(1);
        ipc.once("electronSafeIpc:respond:" + name, function (sucess, result) {
          if (sucess) {
            resolve(result);
          } else {
            reject(result);
          }
        });
        ipc.send("electronSafeIpc:request", name, args);
      } catch (error) {
        reject(err);
      }
    });
  };
};
