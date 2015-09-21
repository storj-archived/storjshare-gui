/* global $ */

'use strict';

var exec = require('exec');
var dataservClientPath;

var log = function(err, out, code) {
	if (err instanceof Error)
		throw err;
	console.log(err);
	console.log(out);
}

exports.initProcess = function() {
	$(document).on('poll', module.exports.poll);
	$(document).on('setDataservClientPath', function(event, path) { module.exports.setDataservClientPath(path); });
	$(document).on('setPayoutAddress', function(event, address) { module.exports.setPayoutAddress(address); });
	$(document).on('addDirectory', function(event, path, size) { module.exports.addDirectory(path, size); });
};

module.exports.poll = function() {
	if(dataservClientPath !== undefined && dataservClientPath !== '') {
		console.log('exec ' + dataservClientPath + ' poll');
		exec([dataservClientPath, 'poll'], log);
	}
};

module.exports.setPayoutAddress = function(address) {
	if(dataservClientPath !== undefined && dataservClientPath !== '' && address !== undefined && address !== '') {
		console.log('exec ' + dataservClientPath + ' config --set_payout_address=' + address);
		exec([dataservClientPath, 'config', '--set_payout_address=' + address], log);
	}
}

module.exports.setDataservClientPath = function(path) {
	dataservClientPath = path;
}

module.exports.addDirectory = function(path, size) {
	if(dataservClientPath !== undefined && dataservClientPath !== '') {
		console.log('exec ' + dataservClientPath + ' --store_path=' + path + ' --max_size=' + size + ' farm');
		exec([dataservClientPath, '--store_path=' + path, '--max_size=' + size, 'farm'], log);
	}
}