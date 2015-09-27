/* global $ */
/* global requirejs */

'use strict';

var exec = require('exec');
var spawn = require('child_process').spawn;
var ipc = require("electron-safe-ipc/guest");

var app;
var logs;
var layout;
var userData;

exports.child;
exports.currentProcess;

var bootstrapProcess = function(name, args) {
	
	exports.terminateProcess();
	exports.currentProcess = name;

	var command = userData.dataservClient + " ";
	for(var i = 0; i < args.length; ++i) {
		command += args[i];
		if(i < args.length - 1) {
			command += ' ';
		}
	}
	logs.add(command);

	exports.child = spawn(userData.dataservClient, args);
	exports.child.stdout.on('data', function (data) {
		logs.add(data.toString());
	});
	exports.child.stderr.on('data', function (data) {
		logs.add(data.toString());
	});

	layout.refresh();
	ipc.send('processStarted');
};

exports.initProcess = function() {
	app = requirejs('./app');
	userData = app.userData;
	logs = requirejs('./modules/logs');
	layout = requirejs('./modules/layout');
	ipc.on('farm', exports.farm);
	ipc.on('terminateProcess', exports.terminateProcess);
};

exports.farm = function() {
	if(app.hasValidSettings()) {
		bootstrapProcess('FARMING', ['--store_path=' + userData.dataservDirectory, '--max_size=' + userData.dataservSize, 'farm']);
	}
}

exports.build = function() {
	if(app.hasValidSettings()) {
		bootstrapProcess('BUILDING', ['--store_path=' + userData.dataservDirectory, '--max_size=' + userData.dataservSize, 'build']);
	}
}

exports.register = function() {
	if(app.hasValidSettings()) {
		bootstrapProcess('REGISTERING', ['register']);
	}
};

exports.poll = function() {
	if(app.hasValidSettings()) {
		bootstrapProcess('POLLING', ['poll']);
	}
};

exports.saveConfig = function() {
	if(app.hasValidDataservClient() && app.hasValidPayoutAddress()) {
		exec(userData.dataservClient, ['config', '--set_payout_address=' + userData.payoutAddress]);
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
	if(exports.child) {
		logs.insert('exports.child ' + exports.child.pid + ' terminated');
		exports.child.kill();
		exports.child = null;
		exports.currentProcess = null;
		layout.refresh();
		ipc.send('processTerminated');
	}
}
