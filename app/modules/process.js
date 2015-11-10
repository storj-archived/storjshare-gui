/* global $ */
/* global requirejs */

'use strict';

var exec = require('child_process').execFile;
var spawn = require('child_process').spawn;
var ipc = require("electron-safe-ipc/guest");
var logs = requirejs('./modules/logs');

exports.child;
exports.currentProcess;

exports.init = function() {
	ipc.on('farm', exports.farm);
	ipc.on('terminateProcess', exports.terminateProcess);
};

var bootstrapProcess = function(dataservClient, name, args) {
	
	exports.terminateProcess();
	exports.currentProcess = name;

	var output = dataservClient + " ";
	for(var i = 0; i < args.length; ++i) {
		output += args[i];
		if(i < args.length - 1) {
			output += ' ';
		}
	}
	logs.addLog(output);
	console.log(output);

	exports.child = spawn(dataservClient, args);
	exports.child.stdout.on('data', function (data) {
		var output = data.toString();
		logs.addLog(output);
		console.log(output);
	});
	exports.child.stderr.on('data', function (data) {
		var output = data.toString();
		logs.addLog(output);
		console.log(output);
	});

	ipc.send('processStarted');
};

exports.farm = function(dataservClient, dataservDirectory, dataservSize, dataservSizeUnit) {
	bootstrapProcess(dataservClient, 'FARMING', ['--store_path=' + dataservDirectory, '--max_size=' + dataservSize + dataservSizeUnit, 'farm']);
}

exports.build = function(dataservClient, dataservDirectory, dataservSize, dataservSizeUnit) {
	bootstrapProcess(dataservClient, 'BUILDING', ['--store_path=' + userData.dataservDirectory, '--max_size=' + userData.dataservSize + userData.dataservSizeUnit, 'build']);
}

exports.register = function(dataservClient) {
	bootstrapProcess(dataservClient, 'REGISTERING', ['register']);
};

exports.poll = function(dataservClient) {
	//if(userData.hasValidSettings()) {
		bootstrapProcess(dataservClient, 'POLLING', ['poll']);
	//}
};

exports.saveConfig = function(dataservClient, payoutAddress) {
	//if(userData.hasValidDataservClient() && userData.hasValidPayoutAddress()) {
		exec(dataservClient, ['config', '--set_payout_address=' + payoutAddress]);
	//}
}

exports.validateDataservClient = function(dataservClient, callback) {
	//if(userData.hasValidDataservClient()) {
		exec(dataservClient, ['version'], function(err, out, code) {
			var output;
			if(err) {
				output = err.toString();
			} else if(out === undefined || out === '') {
				output = 'invalid dataserv-client';
			}
			else {
				requirejs('./modules/logs').addLog('dataserv-client version ' + out);
			}
			if(callback) {
				callback(output);
			}
		});
	//} else if(callback) {
	//	callback('invalid dataserv-client');
	//}
}

exports.terminateProcess = function() {
	if(exports.child) {
		logs.addLog('exports.child ' + exports.child.pid + ' terminated');
		exports.child.kill();
		exports.child = null;
		exports.currentProcess = null;
		ipc.send('processTerminated');
	}
}