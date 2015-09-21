/* global $ */

'use strict';

var exec = require('exec');
var spawn = require('child_process').spawn;

var process;
var dataservClient;
var payoutAddress;
var dataservDirectory;
var dataservSize;

var canExecute = function() {
	if( dataservClient !== undefined && dataservClient !== '' && payoutAddress !== undefined && payoutAddress !== '' &&
		dataservDirectory !== undefined && dataservDirectory !== '' && dataservSize !== undefined && dataservSize !== '' ) {
		return true;
	}
	return false;
};

exports.initProcess = function() {
	$(document).on('build', function(event, outFunc, errFunc) { module.exports.build(outFunc, errFunc); });
	$(document).on('register', function(event, outFunc, errFunc) { module.exports.register(outFunc, errFunc); });
	$(document).on('poll', function(event, outFunc, errFunc) { module.exports.poll(outFunc, errFunc); });

	$(document).on('setDataservClient', function(event, client) { dataservClient = client; });
	$(document).on('setPayoutAddress', function(event, address) { payoutAddress = address; module.exports.saveConfig(); });
	$(document).on('setDataservDirectory', function(event, directory) { dataservDirectory = directory; });
	$(document).on('setDataservSize', function(event, size) { dataservSize = size; });

	$(document).on('terminateProcess', function(event) { if(process) { process.kill(); }});
};

module.exports.build = function(outFunc, errFunc) {
	if(canExecute()) {
		console.log('exec ' + dataservClient + ' --store_path=' + dataservDirectory + ' --max_size=' + dataservSize + ' build');
		process = spawn(dataservClient, ['--store_path=' + dataservDirectory, '--max_size=' + dataservSize, 'build']);
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
			$(document).trigger('addDirectoryComplete', code);
			if(outFunc) outFunc('build process exited with code ' + code);
			if(window.env.name === 'development')
				console.log('build process exited with code ' + code);
		});
	}
}

module.exports.register = function(outFunc, errFunc) {
	if(canExecute()) {
		console.log('exec ' + dataservClient + ' register');
		process = spawn(dataservClient, ['register']);
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
			$(document).trigger('registerDirectoryComplete', code);
			if(outFunc) outFunc('register process exited with code ' + code);
			if(window.env.name === 'development')
				console.log('register process exited with code ' + code);
		});
	}
};

module.exports.poll = function(outFunc, errFunc) {
	if(canExecute()) {
		console.log('exec ' + dataservClient + ' poll');
		process = spawn(dataservClient, ['poll']);
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
			$(document).trigger('pollComplete', code);
			if(outFunc) outFunc('poll process exited with code ' + code);
			if(window.env.name === 'development')
				console.log('poll process exited with code ' + code);
		});
	}
};

module.exports.saveConfig = function() {
	if(canExecute()) {
		console.log('exec ' + dataservClient + ' config --set_payout_address=' + payoutAddress);
		exec([dataservClient, 'config', '--set_payout_address=' + payoutAddress], function(err, out, code) {
			$(document).trigger('setPayoutAddressComplete', code);
		});
	}
}