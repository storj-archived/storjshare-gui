/* global $ */
/* global w2ui */
/* global w2popup */

'use strict';

var os = require('os');
var fs = require('fs');
var request = require('request');
var remote = require('remote');
var app = remote.require('app');
var dialog = remote.require('dialog');
var ipc = require("electron-safe-ipc/guest");

exports.dataservClient = '';
exports.payoutAddress = '';
exports.dataservDirectory = '';
exports.dataservSize = '';
exports.dataservSizeUnit = '';

exports.init = function() {

	// load data from config file
	try {
		exports.read(true);
	} catch (error) {
		console.log(error.toString());
	}

	// HAX = temporary workaroud while automatic setup isn't working on OSX
	if(os.platform() !== 'win32') {
		exports.dataservClient = 'dataserv-client';
	}

	$('#browse').on('click', function (e) {
		dialog.showOpenDialog({ 
			title: 'Please select directory',
			defaultPath: app.getPath('userDesktop'),
			properties: [ 'openDirectory' ]
			}, function(path) {
				if(path !== undefined && path !== "") {
					$('#directory').val(path);
					exports.dataservDirectory = path;
					exports.save();
				}
			}
		);
	});
}

exports.read = function(bQuerySJCX) {
	// load data from config file
	 try {
		//test to see if settings exist
		var path = app.getPath('userData') + '/' + window.env.configFileName;
		console.log('Reading settings from \'' + path + '\'');
		fs.openSync(path, 'r+'); //throws error if file doesn't exist
		var data = fs.readFileSync(path); //file exists, get the contents
		var userData = JSON.parse(data); //turn to js object
		for(var s in userData) {
			exports[s] = userData[s];
		}
		if(exports.hasValidPayoutAddress()) {
			$("#address").val(exports.payoutAddress);
		}
		if(exports.hasValidDataservDirectory()) {
			$("#directory").val(exports.dataservDirectory);
		}
		if(exports.hasValidDataservSize()) {
			$("#size").val(exports.dataservSize);
		}
		if(exports.hasValidDataservSize()) {
			$("#size").val(exports.dataservSize);
			$('#size-unit').val(exports.dataservSizeUnit);
		} else {
			exports.dataservSizeUnit = 'MB';
		}
		exports.validate(true);
	} catch (error) {
		console.log(error.toString());
	}

	// Save settings when user changes the values
	$("#address").change(function() {
		exports.payoutAddress = $("#address").val();
		exports.save(true);
	});
	$("#directory").change(function() {
		exports.dataservDirectory = $("#directory").val();
		exports.save();
	});
	$("#size").change(function() {
		exports.dataservSize = $("#size").val();
		exports.save();
	});
	$("#size-unit").change(function() {
		exports.dataservSizeUnit = $("#size-unit").val();
		exports.save();
	});
}

exports.save = function(bQuerySJCX) {
	try {
		var path = app.getPath('userData') + '/' + window.env.configFileName;
		fs.writeFileSync(path, JSON.stringify({
			dataservClient: exports.dataservClient,
			payoutAddress: exports.payoutAddress,
			dataservDirectory: exports.dataservDirectory,
			dataservSize: exports.dataservSize,
			dataservSizeUnit: exports.dataservSizeUnit
		}) , 'utf-8');
		console.log('Saved settings to \'' + path + '\'');
		requirejs('./modules/process').saveConfig();
	} catch (error) {
		console.log(error.toString());
	}
	exports.validate(bQuerySJCX);
};

exports.validate = function(bQuerySJCX) {
	if(bQuerySJCX) {
		exports.querySJCX();
	}
	$('#start').prop('disabled', !exports.hasValidSettings());
}

exports.hasValidDataservClient = function() {
	return exports.dataservClient !== undefined && exports.dataservClient !== '';
}

exports.hasValidPayoutAddress = function() {
	return exports.payoutAddress !== undefined && exports.payoutAddress !== '';
}

exports.hasValidDataservDirectory = function() {
	return exports.dataservDirectory !== undefined && exports.dataservDirectory !== '';
}

exports.hasValidDataservSize = function() {
	return exports.dataservSize !== undefined && exports.dataservSize !== '';
}

exports.hasValidSettings = function() {
	return (exports.hasValidDataservClient() &&
			exports.hasValidPayoutAddress());
}

exports.querySJCX = function(onComplete) {
	if(exports.hasValidPayoutAddress()) {
		request("http://xcp.blockscan.com/api2?module=address&action=balance&btc_address=" + exports.payoutAddress + "&asset=SJCX",
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var createNewAddressHTML = '<a href="https://counterwallet.io/" class="js-external-link">Create New Address</a>';
				if(!body || body === "") {
					$('#amount').html(createNewAddressHTML);
					return;
				}
				var json = JSON.parse(body);
				if(json.status !== "error") {
					$('#amount').html('<a href="https://counterwallet.io/" class="js-external-link">Current SJCX: ' + json.data[0].balance + '</a>');
				} else if(json.message.search("no available SJCX balance") !== -1) {
					$('#amount').html('<a href="https://counterwallet.io/" class="js-external-link">Current SJCX: 0</a>');
				} else {
					$('#amount').html(createNewAddressHTML);
				}
			} else {
				$('#amount').html(createNewAddressHTML);
				console.log(error.toString());
			}
		});
	}
}