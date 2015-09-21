/* global $ */

'use strict';

var exec = require('exec');
var dataservClientPath;
var payoutAddress;

var log = function(err, out, code) {
	if (err instanceof Error)
		throw err;
	console.log(err);
	console.log(out);
}

var canExecute = function() {
	if(dataservClientPath !== undefined && dataservClientPath !== '' && payoutAddress !== undefined && payoutAddress !== '') {
		return true;
	}
	return false;
};

exports.initProcess = function() {
	$(document).on('poll', module.exports.poll);
	$(document).on('register', module.exports.register);
	$(document).on('setDataservClientPath', function(event, path) { module.exports.setDataservClientPath(path); });
	$(document).on('setPayoutAddress', function(event, address) { module.exports.setPayoutAddress(address); });
	$(document).on('addDirectory', function(event, path, size) { module.exports.addDirectory(path, size); });
};

module.exports.poll = function() {
	if(canExecute()) {
		console.log('exec ' + dataservClientPath + ' poll');
		exec([dataservClientPath, 'poll'], log);
	}
};

module.exports.register = function() {
	if(canExecute()) {
		console.log('exec ' + dataservClientPath + ' register');
		exec([dataservClientPath, 'register'], log);
	}
};

module.exports.setPayoutAddress = function(address) {
	payoutAddress = address;
	if(canExecute()) {
		console.log('exec ' + dataservClientPath + ' config --set_payout_address=' + payoutAddress);
		exec([dataservClientPath, 'config', '--set_payout_address=' + payoutAddress], log);
	}
}

module.exports.setDataservClientPath = function(path) {
	dataservClientPath = path;
	module.exports.register();
}

module.exports.addDirectory = function(path, size) {
	if(canExecute()) {
		console.log('exec ' + dataservClientPath + ' --store_path=\"' + path + '\" --max_size=' + size + ' build');
		exec([dataservClientPath, '--store_path=' + path, '--max_size=' + size, 'build'], log);
	}
}