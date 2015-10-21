/* global $ */
/* global requirejs */

'use strict';

var request = require('request');
var ipc = require('electron-safe-ipc/guest');
var pjson = require('./package.json');

exports.init = function() {
	ipc.on('checkForUpdates', exports.checkForUpdates);
	exports.checkForUpdates(true);
}

exports.checkForUpdates = function(bSilentCheck) {
	try {
		request(pjson.config.versionCheckURL, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var json = JSON.parse(body);
				if(json.version > pjson.version) {
					$('#modalUpdateAvailable').modal('show');
				} else if(!bSilentCheck) {
					$('#modalNoUpdateAvailable').modal('show');
				}
			} else {
				console.log(error.toString());
			}
		})
	} catch(error) {
		console.log(error.toString());
	}
}