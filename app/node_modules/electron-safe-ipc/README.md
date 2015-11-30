electron-safe-ipc [![npm version](https://badge.fury.io/js/electron-safe-ipc.svg)](http://badge.fury.io/js/electron-safe-ipc)
================

electron-safe-ipc is a safe communication library between the main process and renderer processes in Electron.

"Safe" means:

* Works even when `node-integration` == `false` in renderer processes
* Works without JS object instance sharing

It uses:

* JSON to pack data
* Electron `protocol` to send message to main process
* Electron `WebContents.executeJavaScript` to send message to renderer process

Used in [Wantedly, Inc.](https://www.wantedly.com/)

Install
----------------

```
npm install --save electron-safe-ipc
```

Use
----------------

### Main process

```js
// in main
var ipc = require("electron-safe-ipc/host");

ipc.on("fromRenderer", function (a, b) {
  console.log("fromRenderer received", a, b);
});
ipc.send("fromMain", 1, 2);
```

### Renderer process

#### Node style

If `"node-integration"` is disabled, use bundling tools (e.g., [browserify](http://browserify.org/)).

```js
var ipc = require("electron-safe-ipc/guest");

ipc.on("fromMain", function (a, b) {
  ipc.send("fromRenderer", a, b);
});
```

#### Traditional style (UMD)

```html
<script src="path/to/node_modules/electron-safe-ipc/guest-bundle.js"></script>
<script>
  electronSafeIpc.on("fromMain", function (a1, a2) {
    electronSafeIpc.send("fromRenderer", a1, a2);
  });
</script>
```

### Communicate between renderer process and `<webview>`

You can use electron-safe-ipc to communicate between renderer processes and webviews.

LIMITATION: you cannot use `"electron-safe-ipc/host-webview"` multiple times (e.g., reloading renderer window or using multiple windows not supported).

```js
// in renderer
var ipc = require("electron-safe-ipc/host-webview");

ipc.on("fromWebview", function (a, b) {
  console.log("fromWebview received", a, b);
});
ipc.send("fromRenderer", 1, 2);
```

```html
<!-- in webview -->
<script src="path/to/node_modules/electron-safe-ipc/guest-bundle.js"></script>
<script>
  electronSafeIpc.on("fromRenderer", function (a1, a2) {
    electronSafeIpc.send("fromWebview", a1, a2);
  });
</script>
```

API
----------------

`ipc` is an [`EventEmitter`](https://nodejs.org/api/events.html#events_class_events_eventemitter).

### `ipc.send(channel: string, ...args)`

Send a message between processes.

The arguments are packed into JSON.

The message is sent to all renderer processes when you call this from the main process.

### `ipc.on(channel: string, callback: (...args) => void)`

Receive messages.

**Other `EventEmitter` methods can also be used to listen to messages.**

### `ipc.request(requestName: string, ...args): Promise`

Sends a request to the other side and get the response as `Promise`.

```js
var ipc = require("electron-safe-ipc/guest");

ipc.request("add", 1, 2)
  .then(function(res) {
    console.log(res);
  });

ipc.request("wait", 1000)
  .then(function(res) {
    console.log("waited 1000 ms");
  });
```

### `ipc.respond(requestName: string, responder: (...args) => Promise|any)`

Registers a responder for the request. `responder` can return both `Promise` and normal values.

```js
var ipc = require("electron-safe-ipc/host");

ipc.respond("add", function (a, b) {
  return a + b;
});

ipc.respond("wait", function (ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
});
```
