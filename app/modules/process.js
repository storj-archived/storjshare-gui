/* global $ */
/* global requirejs */

'use strict';

var exec = require('exec');
var spawn = require('child_process').spawn;
var ipc = require("electron-safe-ipc/guest");

var output;
var userData;

exports.child;
exports.currentProcess;

exports.init = function() {
	userData = requirejs('./modules/userdata')
	output = requirejs('./modules/output');
	ipc.on('farm', exports.farm);
	ipc.on('terminateProcess', exports.terminateProcess);
};

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
	output.add(command);

	exports.child = spawn(userData.dataservClient, args);
	exports.child.stdout.on('data', function (data) {
		output.add(data.toString());
	});
	exports.child.stderr.on('data', function (data) {
		output.add(data.toString());
	});

	ipc.send('processStarted');
};

exports.farm = function() {
	if(userData.hasValidSettings()) {
		bootstrapProcess('FARMING', ['--store_path=' + userData.dataservDirectory, '--max_size=' + userData.dataservSize, 'farm']);
	}
}

exports.build = function() {
	if(userData.hasValidSettings()) {
		bootstrapProcess('BUILDING', ['--store_path=' + userData.dataservDirectory, '--max_size=' + userData.dataservSize, 'build']);
	}
}

exports.register = function() {
	if(userData.hasValidSettings()) {
		bootstrapProcess('REGISTERING', ['register']);
	}
};

exports.poll = function() {
	if(userData.hasValidSettings()) {
		bootstrapProcess('POLLING', ['poll']);
	}
};

exports.saveConfig = function() {
	if(userData.hasValidDataservClient() && userData.hasValidPayoutAddress()) {
		exec(userData.dataservClient, ['config', '--set_payout_address=' + userData.payoutAddress]);
	}
}

exports.validateDataservClient = function(callback) {
	if(userData.hasValidDataservClient()) {
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
		output.insert('exports.child ' + exports.child.pid + ' terminated');
		exports.child.kill();
		exports.child = null;
		exports.currentProcess = null;
		ipc.send('processTerminated');
	}
}
