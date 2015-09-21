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

var bootstrapProcess = function(name, args, outFunc, errFunc) {
	if(canExecute()) {
		console.log('spawn ' + dataservClient + ' ' + args.toString());
		process = spawn(dataservClient, args);
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
	}
}

exports.initProcess = function() {
	$(document).on('farm', function(event, outFunc, errFunc) { module.exports.farm(outFunc, errFunc); });
	$(document).on('build', function(event, outFunc, errFunc) { module.exports.build(outFunc, errFunc); });
	$(document).on('register', function(event, outFunc, errFunc) { module.exports.register(outFunc, errFunc); });
	$(document).on('poll', function(event, outFunc, errFunc) { module.exports.poll(outFunc, errFunc); });

	$(document).on('setDataservClient', function(event, client) { dataservClient = client; });
	$(document).on('setPayoutAddress', function(event, address) { payoutAddress = address; module.exports.saveConfig(); });
	$(document).on('setDataservDirectory', function(event, directory) { dataservDirectory = directory; });
	$(document).on('setDataservSize', function(event, size) { dataservSize = size; });

	$(document).on('terminateProcess', function(event) { if(process) { process.kill(); }});
};

module.exports.farm = function(outFunc, errFunc) {
	bootstrapProcess('farm', ['--store_path=' + dataservDirectory, '--max_size=' + dataservSize, 'farm'], outFunc, errFunc);
}

module.exports.build = function(outFunc, errFunc) {
	bootstrapProcess('build', ['--store_path=' + dataservDirectory, '--max_size=' + dataservSize, 'build'], outFunc, errFunc);
}

module.exports.register = function(outFunc, errFunc) {
	bootstrapProcess('register', ['register'], outFunc, errFunc);
};

module.exports.poll = function(outFunc, errFunc) {
	bootstrapProcess('poll', ['poll'], outFunc, errFunc);
};

module.exports.saveConfig = function() {
	if(canExecute()) {
		console.log('exec ' + dataservClient + ' config --set_payout_address=' + payoutAddress);
		exec([dataservClient, 'config', '--set_payout_address=' + payoutAddress], function(err, out, code) {
			$(document).trigger('saveConfigComplete', code);
		});
	}
}