/* global $ */
/* global w2ui */
/* global w2popup */

'use strict';

var fs = require('fs');
var remote = require('remote');
var app = remote.require('app');

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
	} catch (err) {
		//if error, then there was no settings file (first run).
		console.log(err.message);
	}
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

document.getElementById('env-name').innerHTML = window.env.name;
document.getElementById('version').innerHTML = window.env.version;