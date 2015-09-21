/* global $ */

'use strict';

var exec = require('exec');
var spawn = require('child_process').spawn;

var process;
var payoutAddress;
var dataservClientPath;

var canExecute = function() {
	if(dataservClientPath !== undefined && dataservClientPath !== '' && payoutAddress !== undefined && payoutAddress !== '') {
		return true;
	}
	return false;
};

exports.initProcess = function() {
	$(document).on('poll', function(event, outFunc, errFunc) { module.exports.poll(outFunc, errFunc); });
	$(document).on('register', function(event, outFunc, errFunc) { module.exports.register(outFunc, errFunc); });
	$(document).on('setDataservClientPath', function(event, path) { module.exports.setDataservClientPath(path); });
	$(document).on('setPayoutAddress', function(event, address) { module.exports.setPayoutAddress(address); });
	$(document).on('addDirectory', function(event, path, size, outFunc, errFunc) { module.exports.addDirectory(path, size, outFunc, errFunc); });
	$(document).on('terminateProcess', function(event) { if(process) { process.kill(); }});
};

module.exports.poll = function(outFunc, errFunc) {
	if(canExecute()) {
		console.log('exec ' + dataservClientPath + ' poll');
		process = spawn(dataservClientPath, ['poll']);
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
			console.log('poll process exited with code ' + code);
		});
	}
};

module.exports.register = function(outFunc, errFunc) {
	if(canExecute()) {
		console.log('exec ' + dataservClientPath + ' register');
		process = spawn(dataservClientPath, ['register']);
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
			console.log('register process exited with code ' + code);
		});
	}
};

module.exports.setPayoutAddress = function(address) {
	payoutAddress = address;
	if(canExecute()) {
		console.log('exec ' + dataservClientPath + ' config --set_payout_address=' + payoutAddress);
		exec([dataservClientPath, 'config', '--set_payout_address=' + payoutAddress], function(err, out, code) {
			$(document).trigger('setPayoutAddressComplete', code);
		});
	}
}

module.exports.setDataservClientPath = function(path) {
	dataservClientPath = path;
	module.exports.register();
}

module.exports.addDirectory = function(path, size, outFunc, errFunc) {
	if(canExecute()) {
		console.log('exec ' + dataservClientPath + ' --store_path=' + path + ' --max_size=' + size + ' build');
		process = spawn(dataservClientPath, ['--store_path=' + path, '--max_size=' + size, 'build']);
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
			console.log('build process exited with code ' + code);
		});
	}
}