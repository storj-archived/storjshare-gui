/* global $ */
/* global requirejs */

'use strict';

var os = require('os');
var exec = require('child_process').execFile;
var child_process = require('child_process');
var spawn = require('child_process').spawn;
var ipc = require("electron-safe-ipc/guest");

console.log("cow")


child_process.execFile('C:/Users/JP/Documents/electron/ethminer', ['ethminer -F mine.weipool.org:5555/0x738601e43fa32334e32b9aab4eed8f8659b82d02/25 -G'], function(error, stdout, stderr){
	console.log(stdout);
});
/*
 require('child_process').exec(__dirname + "/steamminer.bat", function (err, stdout, stderr) {
    if (err) {
        // Ooops.
        // console.log(stderr);
        return console.log(err);
    }

    // Done.
    console.log(stdout);
});
*/
