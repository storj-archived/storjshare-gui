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

	var printedArgs;
	for(var i = 0; i < args.length; ++i) {
		printedArgs += args[i];
		if(i < args.length - 1) {
			printedArgs += ' ';
		}
	}
	grid.insertRecord(printedArgs);
	process = spawn(userData.dataservClient, args);
	process.stdout.on('data', function (data) {
		grid.insertRecord(data.toString());
		if(window.env.name === 'development')
			console.log(data.toString());
	});
	process.stderr.on('data', function (data) {
		grid.insertRecord(data.toString());
		if(window.env.name === 'development')
			console.log(data.toString());
	});
	process.on('exit', function (code) {
		grid.insertRecord(name + ' process exited with code ' + code);
		if(window.env.name === 'development')
			console.log(name + ' process exited with code ' + code);
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
		grid.clear();
		grid.insertRecord(userData.dataservClient + ' config --set_payout_address=' + userData.payoutAddress);
		exec([userData.dataservClient, 'config', '--set_payout_address=' + userData.payoutAddress], function(err, out, code) {
			if(err) {
				grid.insertRecord(err.toString());
			} else if(out) {
				grid.insertRecord(out.toString());
			}
			grid.insertRecord('process exited with code ' + code);
		});
	}
}

exports.validateDataservClient = function() {
	if(app.hasValidDataservClient()) {
		console.log(userData.dataservClient + ' version');
		exec([userData.dataservClient, 'version'], function(err, out, code) {
			if(err) {
				grid.insertRecord(err.toString());
			} else if(out) {
				grid.insertRecord(out.toString());
			}
			if(code !== 0) {
				grid.insertRecord( 'Wrong dataserv-client specified: ' + userData.dataservClient);
			}
		});
	}
}

exports.terminateProcess = function() {
	if(process) {
		process.kill();
		process = null;
	}
}