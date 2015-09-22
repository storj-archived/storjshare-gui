/* global $ */
'use strict';

var exec = require('exec');
var spawn = require('child_process').spawn;

var app;
var process;
var userData;

var bootstrapProcess = function(name, args, outFunc, errFunc) {
	console.log('spawn ' + userData.dataservClient + ' ' + args.toString());
	process = spawn(userData.dataservClient, args);
	process.stdout.on('data', function (data) {
		if(outFunc) outFunc(data);
		if(window.env.name === 'development')
			console.log(data.toString());
	});
	process.stderr.on('data', function (data) {
		if(errFunc) errFunc(data);
		else if(outFunc) outFunc(data);
		if(window.env.name === 'development')
			console.log(data.toString());
	});
	process.on('exit', function (code) {
		$(document).trigger(name + 'Complete', code);
		if(outFunc) outFunc(name + ' process exited with code ' + code);
		if(window.env.name === 'development')
			console.log(name + ' process exited with code ' + code);
	});
};

exports.initProcess = function() {
	app = requirejs('./app');
	userData = app.userData;
};

exports.farm = function(outFunc, errFunc) {
	if(app.hasValidSettings()) {
		bootstrapProcess('farm', ['--store_path=' + userData.dataservDirectory, '--max_size=' + userData.dataservSize, 'farm'], outFunc, errFunc);
	}
}

exports.build = function(outFunc, errFunc) {
	if(app.hasValidSettings()) {
		bootstrapProcess('build', ['--store_path=' + userData.dataservDirectory, '--max_size=' + userData.dataservSize, 'build'], outFunc, errFunc);
	}
}

exports.register = function(outFunc, errFunc) {
	if(app.hasValidSettings()) {
		bootstrapProcess('register', ['register'], outFunc, errFunc);
	}
};

exports.poll = function(outFunc, errFunc) {
	if(app.hasValidSettings()) {
		bootstrapProcess('poll', ['poll'], outFunc, errFunc);
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