/* global $ */
/* global w2ui */
/* global w2popup */

'use strict';

var os = require('os');
var fs = require('fs');
var remote = require('remote');
var request = require('request');
var app = remote.require('app');
var ipc = require("electron-safe-ipc/guest");
var pjson = require('./package.json');

// public
exports.userData = {
	dataservClient: '',
	payoutAddress: '',
	dataservDirectory: '',
	dataservSize: ''
};

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
	}

	// temporary workaroud while automatic setup isn't working on OSX
	if(os.platform() !== 'win32') {
		exports.userData.dataservClient = 'dataserv-client';
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
			exports.hasValidPayoutAddress());
};

exports.checkForUpdates = function(bSilentCheck) {
	try {
		request(pjson.config.versionCheckURL, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var json = JSON.parse(body);
				if(json.version !== pjson.version) {
					w2popup.open({
						title     : 'New Update Available',
						body      : '<div class="w2ui-centered">A new update is available.<br><br>' +
									'<a href="https://github.com/Storj/driveshare-gui/releases" class="js-external-link">Click here to get it.</a></div>',
						buttons   : '<button class="btn" onclick="w2popup.close();">Close</button>',
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
	w2popup.open({
		title     : 'About DriveShare',
		body      : '<div class="w2ui-centered">' +
		'<p class="subtitle">' +
		'	<a href="http://driveshare.org/" class="js-external-link">Storj DriveShare</a> version <strong>' + window.env.version + '</strong>.' +
		'</p>' +
		'<p class="subtitle">' +
		'	Please <a href="https://github.com/Storj/driveshare-gui/issues" class="js-external-link">post an issue on the github repo</a> if you encounter a problem. Thank you for being an early supporter of Storj.' +
		'</p>' +
		'</div>',
		buttons   : '<button class="btn" onclick="w2popup.close();">Close</button> ',
		width     : 300,
		height    : 200,
		overflow  : 'hidden',
		color     : '#333',
		speed     : '0.3',
		opacity   : '0.8',
		modal     : true,
		showClose : false,
		showMax   : false,
	});
}