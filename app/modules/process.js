/* global $ */

'use strict';

var exec = require('exec');
var dataservClientPath;
var payoutAddress;

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
		exec([dataservClientPath, 'poll'], function(err, out, code) {
			$(document).trigger('pollComplete', [err, out, code])
		});
	}
};

module.exports.register = function() {
	if(canExecute()) {
		console.log('exec ' + dataservClientPath + ' register');
		exec([dataservClientPath, 'register'], function(err, out, code) {
			$(document).trigger('registerComplete', [err, out, code])
		});
	}
};

module.exports.setPayoutAddress = function(address) {
	payoutAddress = address;
	if(canExecute()) {
		console.log('exec ' + dataservClientPath + ' config --set_payout_address=' + payoutAddress);
		exec([dataservClientPath, 'config', '--set_payout_address=' + payoutAddress], function(err, out, code) {
			$(document).trigger('setPayoutAddressComplete', [err, out, code])
		});
	}
}

module.exports.setDataservClientPath = function(path) {
	dataservClientPath = path;
	module.exports.register();
}

module.exports.addDirectory = function(path, size) {
	if(canExecute()) {
		console.log('exec ' + dataservClientPath + ' --store_path=\"' + path + '\" --max_size=' + size + ' build');
		exec([dataservClientPath, '--store_path=' + path, '--max_size=' + size, 'build'], function(err, out, code) {
			$(document).trigger('addDirectoryComplete', [err, out, code])
		});
	}
}