/* global $ */
/* global requirejs */

'use strict';

var exec = require('child_process').execFile;
var spawn = require('child_process').spawn;
var ipc = require("electron-safe-ipc/guest");

var userData;
exports.child;
exports.currentProcess;

exports.init = function() {
	userData = requirejs('./modules/userdata')
	ipc.on('farm', exports.farm);
	ipc.on('terminateProcess', exports.terminateProcess);

	$('#start').on('click', function (e) {
		var l = Ladda.create(this);
		if(exports.currentProcess) {
			l.stop();
			$('#start').css({ 'background-color': '#88C425', 'border-color': '#88C425' }); // green
			$('#start-label').text('START');
			exports.terminateProcess();
		} else if(userData.hasValidSettings()) {
			l.start();
			// l.start causes the bootstrap button to be unclickable, this ensures we can still click the button
			$('#start').removeAttr('disabled');
			$('#start').css({ 'background-color': '#FFA500', 'border-color': '#FFA500' }); // orange
			$('#start-label').text('RUNNING, CLICK TO ABORT');
			exports.farm();
		}
	});
};

var bootstrapProcess = function(name, args) {
	
	exports.terminateProcess();
	exports.currentProcess = name;

	var output = userData.dataservClient + " ";
	for(var i = 0; i < args.length; ++i) {
		output += args[i];
		if(i < args.length - 1) {
			output += ' ';
		}
	}
	ipc.send("addLog", output);
	console.log(output);

	exports.child = spawn(userData.dataservClient, args);
	exports.child.stdout.on('data', function (data) {
		var output = data.toString();
		ipc.send("addLog", output);
		console.log(output);
	});
	exports.child.stderr.on('data', function (data) {
		var output = data.toString();
		ipc.send("addLog", output);
		console.log(output);
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
		ipc.send("addLog", 'exports.child ' + exports.child.pid + ' terminated');
		exports.child.kill();
		exports.child = null;
		exports.currentProcess = null;
		ipc.send('processTerminated');
	}
}
