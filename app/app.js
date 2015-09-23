/* global $ */
/* global w2ui */
/* global w2popup */

'use strict';

var fs = require('fs');
var remote = require('remote');
var request = require('request');
var app = remote.require('app');
var ipc = require("electron-safe-ipc/guest");

// public
exports.userData = {
	dataservClient: '',
	payoutAddress: '',
	dataservDirectory: '',
	dataservSize: ''
};

//document.getElementById('env-name').innerHTML = window.env.name;
//document.getElementById('version').innerHTML = window.env.version;

exports.initApp = function() {
	// load data from config file
	 try {
		//test to see if settings exist
		var path = app.getPath('userData') + '/' + window.env.configFileName;
		console.log('Reading settings from \'' + path + '\'');
		fs.openSync(path, 'r+'); //throws error if file doesn't exist
		var data = fs.readFileSync(path); //file exists, get the contents
		exports.userData = JSON.parse(data); //turn to js object
	} catch (error) {
		//if error, then there was no settings file (first run).
		console.log(error.message);
	}

	ipc.on('popupAboutDialog', exports.popupAboutDialog);
	ipc.on('checkForUpdates', exports.checkForUpdates);
	exports.checkForUpdates(true);
};

exports.saveSettings = function() {
	try {
		requirejs('./modules/process').saveConfig();
		var path = app.getPath('userData') + '/' + window.env.configFileName;
		fs.writeFileSync(path, JSON.stringify(exports.userData) , 'utf-8');
		console.log('Saved settings to \'' + path + '\'');
	} catch (error) {
		w2alert(error.toString(), "Error");
	}
};

exports.hasValidDataservClient = function() {
	return exports.userData.dataservClient !== undefined && exports.userData.dataservClient !== '';
};

exports.hasValidPayoutAddress = function() {
	return exports.userData.payoutAddress !== undefined && exports.userData.payoutAddress !== '';
};

exports.hasValidDataservDirectory = function() {
	return exports.userData.dataservDirectory !== undefined && exports.userData.dataservDirectory !== '';
};

exports.hasValidDataservSize = function() {
	return exports.userData.dataservSize !== undefined && exports.userData.dataservSize !== '';
};

exports.hasValidSettings = function() {
	return (exports.hasValidDataservClient() &&
			exports.hasValidPayoutAddress() &&
			exports.hasValidDataservDirectory() &&
			exports.hasValidDataservSize());
};

exports.checkForUpdates = function(bSilentCheck) {
	try {
		request(env.versionCheckURL, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var json = JSON.parse(body);
				if(json.version !== env.version) {
					w2popup.open({
						title     : 'New Update Available',
						body      : '<div class="w2ui-centered">A new update is available.<br><br>' +
									'<a href="https://github.com/Storj/driveshare-gui/releases" class="js-external-link">Click here to get it.</a></div>',
						buttons   : '<button class="btn" onclick="w2popup.close();">Close</button> ',
						width     : 300,
						height    : 150,
						overflow  : 'hidden',
						color     : '#333',
						speed     : '0.3',
						opacity   : '0.8',
						modal     : true,
						showClose : false,
						showMax   : false,
					});
				} else if(!bSilentCheck) {
					w2popup.open({
						title     : 'Already Using the Latest Version',
						body      : '<div class="w2ui-centered">No updates available.<br>' +
									'You are already using the latest version.</div>',
						buttons   : '<button class="btn" onclick="w2popup.close();">Close</button> ',
						width     : 300,
						height    : 150,
						overflow  : 'hidden',
						color     : '#333',
						speed     : '0.3',
						opacity   : '0.8',
						modal     : true,
						showClose : false,
						showMax   : false,
					});
				}
			} else {
				w2alert(error.toString(), "Error");
			}
		})
	} catch(error) {
		w2alert(error.toString(), "Error");
	}
};

exports.popupAboutDialog = function() {
	var body = requirejs('./package').name + " " + requirejs('./package').name
	w2popup.open({
		title     : 'About DataShare',
		body      : '<div class="w2ui-centered">No updates available.<br>' +
					'You are already using the latest version.</div>',
		buttons   : '<button class="btn" onclick="w2popup.close();">Close</button> ',
		width     : 300,
		height    : 150,
		overflow  : 'hidden',
		color     : '#333',
		speed     : '0.3',
		opacity   : '0.8',
		modal     : true,
		showClose : false,
		showMax   : false,
	});
}