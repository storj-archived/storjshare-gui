/* global $ */
/* global Ladda */
/* global requirejs */

'use strict';

var os = require('os');
var exec = require('child_process').execFile;
var spawn = require('child_process').spawn;
var ipc = require("electron-safe-ipc/guest");

var userData;
var l = Ladda.create($('#start').get(0));
var logs = requirejs('./modules/logs');

exports.child;
exports.currentProcess;

exports.init = function() {
	userData = requirejs('./modules/userdata')
	ipc.on('farm', exports.farm);
	ipc.on('terminateProcess', exports.terminateProcess);

	$('#start').on('click', function (e) {
		if(exports.currentProcess) {
			exports.terminateProcess();
		} else if(userData.hasValidSettings()) {
			exports.farm();
		}
	});
};

var realizeUI = function() {
	var isDisabled = exports.currentProcess !== null;

	$(".main").toggleClass('disabled', isDisabled );
	$("#address").prop('disabled', isDisabled);
	$("#directory").prop('disabled', isDisabled);
	$("#browse").prop('disabled', isDisabled);
	$("#size").prop('disabled', isDisabled);
	$('#size-unit').prop('disabled', isDisabled);

	if(isDisabled) {
		l.start();
		$('#start').prop('disabled', false); // l.start causes the bootstrap button to be unclickable, this ensures we can still click the button
		$('#start').css({ 'background-color': '#FFA500', 'border-color': '#FFA500' }); // orange
		$('#start-label').text('RUNNING, CLICK TO ABORT');
	} else {
		l.stop();
		$('#start').css({ 'background-color': '#88C425', 'border-color': '#88C425' }); // green
		$('#start-label').text('START');
	}
}

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
	logs.addLog(output);
	console.log(output);

	exports.child = spawn(userData.dataservClient, args);
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
	realizeUI();
};

exports.farm = function() {
	if(userData.hasValidSettings()) {
		bootstrapProcess('FARMING', ['--store_path=' + userData.dataservDirectory, '--max_size=' + userData.dataservSize + userData.dataservSizeUnit, 'farm']);
	}
}

exports.build = function() {
	if(userData.hasValidSettings()) {
		bootstrapProcess('BUILDING', ['--store_path=' + userData.dataservDirectory, '--max_size=' + userData.dataservSize + userData.dataservSizeUnit, 'build']);
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
		exec(userData.dataservClient, ['version'], function(err, out, code) {
			var output;
			if(err) {
				output = err.toString();
			} else if(os.platform() === 'win32') {
				if(out === undefined || out === '') {
					output = 'invalid dataserv-client';
				} else {
					requirejs('./modules/logs').addLog('dataserv-client version ' + out);
				}
			} else {
				if(code === undefined || code === '') {
					output = 'invalid dataserv-client';
				} else {
					requirejs('./modules/logs').addLog(code);
				}
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
		logs.addLog('exports.child ' + exports.child.pid + ' terminated');
		exports.child.kill();
		exports.child = null;
		exports.currentProcess = null;
		ipc.send('processTerminated');
		realizeUI();
		Ladda.create($('#start')).stop();
		$('#start').css({ 'background-color': '#88C425', 'border-color': '#88C425' }); // green
		$('#start-label').text('START');
	}
}