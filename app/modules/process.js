/* global $ */
/* global requirejs */

'use strict';

var exec = require('exec');
var spawn = require('child_process').spawn;
var ipc = require("electron-safe-ipc/guest");

var app;
var grid;
var process;
var userData;

var bootstrapProcess = function(name, args) {
	
	grid.clear();
	exports.terminateProcess();

	var command = userData.dataservClient + " ";
	for(var i = 0; i < args.length; ++i) {
		command += args[i];
		if(i < args.length - 1) {
			command += ' ';
		}
	}
	grid.insertRecord(command);

	process = spawn(userData.dataservClient, args);
	process.stdout.on('data', function (data) {
		grid.insertRecord(data.toString());
	});
	process.stderr.on('data', function (data) {
		grid.insertRecord(data.toString());
	});
};

exports.initProcess = function() {
	app = requirejs('./app');
	userData = app.userData;
	grid = requirejs('./modules/grid');
	ipc.on('farm', exports.farm);
	ipc.on('terminateProcess', exports.terminateProcess);
};

exports.farm = function() {
	if(app.hasValidSettings()) {
		bootstrapProcess('farm', ['--store_path=' + userData.dataservDirectory, '--max_size=' + userData.dataservSize, 'farm']);
	}
}

exports.build = function() {
	if(app.hasValidSettings()) {
		bootstrapProcess('build', ['--store_path=' + userData.dataservDirectory, '--max_size=' + userData.dataservSize, 'build']);
	}
}

exports.register = function() {
	if(app.hasValidSettings()) {
		bootstrapProcess('register', ['register']);
	}
};

exports.poll = function() {
	if(app.hasValidSettings()) {
		bootstrapProcess('poll', ['poll']);
	}
};

exports.saveConfig = function() {
	if(app.hasValidDataservClient() && app.hasValidPayoutAddress()) {
		bootstrapProcess('config', ['config', '--set_payout_address=' + userData.payoutAddress]);
	}
}

exports.validateDataservClient = function(callback) {
	if(app.hasValidDataservClient()) {
		exec([userData.dataservClient, 'version'], function(err, out, code) {
			var output;
			if(err) {
				output = err.toString();
			}
			if(code !== 0) {
				output = 'invalid dataserv-client';
			}
			if(callback) {
				callback(output);
			}
		});
	} else if(callback) {
		callback('invalid dataserv-client');
	}
}

exports.terminateProcess = function() {
	if(process) {
		grid.insertRecord('process ' + process.pid + ' terminated');
		process.kill();
		process = null;
	}
}
