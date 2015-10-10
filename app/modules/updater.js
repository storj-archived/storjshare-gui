/* global $ */
/* global requirejs */

'use strict';


var request = require('request');
var ipc = require('electron-safe-ipc/guest');
var pjson = require('./package.json');

exports.init = function() {
	ipc.on('checkForUpdates', exports.checkForUpdates);
}

exports.checkForUpdates = function(bSilentCheck) {
	try {
		request(pjson.config.versionCheckURL, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var remote = require('remote'); 
				var dialog = remote.require('dialog');
				var json = JSON.parse(body);
				if(json.version > pjson.version) {
					dialog.showMessageBox({
						type: 'question',
						buttons: [ 'Yes', 'No' ],
						title: 'New Update Available',
						message: 'A new update is available. Would you like to update now?'
						},
						function(response) {
							if(response === 'Yes') {
								var shell = remote.require('shell');
								shell.openExternal('https://github.com/Storj/driveshare-gui/releases');
							}
						}
					);
				} else if(!bSilentCheck) {
					dialog.showMessageBox({
						title: 'No Update Available',
						buttons: [ 'Close' ],
						message: 'You are already using the latest version.'
						}
					);
				}
			} else {
				console.log(error.toString());
			}
		})
	} catch(error) {
		console.log(error.toString());
	}
};