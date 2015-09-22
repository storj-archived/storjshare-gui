/* global $ */
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

	console.log('spawn ' + userData.dataservClient + ' ' + args.toString());
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
		$(document).trigger(name + 'Complete', code);
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
	if(app.hasValidSettings()) {
		console.log('exec ' + userData.dataservClient + ' config --set_payout_address=' + userData.payoutAddress);
		exec([userData.dataservClient, 'config', '--set_payout_address=' + userData.payoutAddress], function(err, out, code) {
			$(document).trigger('saveConfigComplete', code);
		});
	}
}

exports.validateDataservClient = function(onComplete) {
	console.log('exec ' + userData.dataservClient + ' version');
	exec([userData.dataservClient, 'version'], function(err, out, code) {
		console.log(out);
		onComplete(code !== 0 ? "Wrong dataserv-client specified: " + userData.dataservClient : null);
	});
}

exports.terminateProcess = function() {
	if(process) {
		process.kill();
		process = null;
	}
}