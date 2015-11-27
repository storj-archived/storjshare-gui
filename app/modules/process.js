/* global $ */
/* global requirejs */

'use strict';

var os = require('os');
var exec = require('child_process').execFile;
var spawn = require('child_process').spawn;
var ipc = require("electron-safe-ipc/guest");
var logs = require('./logs');

exports.children = [];
exports.currentProcesses = [];

exports.init = function() {
	ipc.on('farm', exports.farm);
	ipc.on('terminateProcess', exports.terminateProcess);
};

var bootstrapProcess = function(dataservClient, name, args) {

	exports.terminateProcess(dataservClient);
	exports.currentProcesses[dataservClient] = name;

	var output = dataservClient + " ";
	for(var i = 0; i < args.length; ++i) {
		output += args[i];
		if(i < args.length - 1) {
			output += ' ';
		}
	}
	logs.addLog(output);
	console.log(output);

	exports.children[dataservClient] = spawn(dataservClient, args);
	exports.children[dataservClient].stdout.on('data', function (data) {
		var output = data.toString();
		logs.addLog(output);
		console.log(output);
	});
	exports.children[dataservClient].stderr.on('data', function (data) {
		var output = data.toString();
		logs.addLog(output);
		console.log(output);
		ipc.send('processTerminated');
	});

	ipc.send('processStarted');
};

exports.farm = function(dataservClient, dataservDirectory, dataservSize, dataservSizeUnit) {
	bootstrapProcess(dataservClient, 'FARMING', ['--store_path="' + dataservDirectory + '"', '--max_size=' + dataservSize + dataservSizeUnit, 'farm']);
}

exports.build = function(dataservClient, dataservDirectory, dataservSize, dataservSizeUnit) {
	bootstrapProcess(dataservClient, 'BUILDING', ['--store_path="' + userData.dataservDirectory + '"', '--max_size=' + userData.dataservSize + userData.dataservSizeUnit, 'build']);
}

exports.register = function(dataservClient) {
	bootstrapProcess(dataservClient, 'REGISTERING', ['register']);
};

exports.poll = function(dataservClient) {
	bootstrapProcess(dataservClient, 'POLLING', ['poll']);
};

exports.saveConfig = function(dataservClient, payoutAddress) {
	console.log(dataservClient, payoutAddress)
	exec(dataservClient, ['config', '--set_payout_address=' + payoutAddress]);
}

exports.validateDataservClient = function(dataservClient, callback) {
	exec(dataservClient, ['version'], function(err, out, code) {
		var output;
		if(err) {
			output = err.toString();
		} else if(os.platform() !== 'darwin') {
			if(out === undefined || out === '') {
				output = 'error: invalid dataserv-client';
			} else {
				require('./logs').addLog('dataserv-client version ' + out);
			}
		} else {
			if(code === undefined || code === '') {
				output = 'invalid dataserv-client';
			} else {
				require('./logs').addLog(code);
			}
		}

		if(callback) {
			callback(output);
		}
	});
}

exports.terminateProcess = function(dataservClient) {
	if(exports.children && exports.children[dataservClient]) {
		logs.addLog('exports.child ' + exports.children[dataservClient].pid + ' terminated');
		exports.children[dataservClient].kill();
		exports.children[dataservClient] = null;
		exports.currentProcesses[dataservClient] = null;
		ipc.send('processTerminated');
	}
}
