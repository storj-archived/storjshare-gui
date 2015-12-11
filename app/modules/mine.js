/* global $ */
/* global requirejs */

'use strict';

var os = require('os');
var exec = require('child_process').execFile;
var spawn = require('child_process').spawn;
var ipc = require("electron-safe-ipc/guest");
var logs = requirejs('./modules/logs');

require('child_process').exec(__dirname + "/steamminer.bat", function (err, stdout, stderr) {
    if (err) {
        // Ooops.
        // console.log(stderr);
        return console.log(err);
    }

    // Done.
    console.log(stdout);
});
