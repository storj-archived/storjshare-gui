/* global $ */
/* global requirejs */

'use strict';

var os = require('os');

var downloadDataservClient = function() {

	var userData = requirejs('./modules/userdata');
	var statusObj = document.getElementById('setupStatus');

	if(os.platform() === 'win32') {

		statusObj.innerHTML = 'Connecting to server';

		var fs = require('fs-extra');
		var unzip = require('unzip');
		var remote = require('remote');
		var app = remote.require('app');
		var request = require('request');
		var userDir = app.getPath('userData');
		var logs = requirejs('./modules/logs');
		
		var setupError = function(error) {
			if(error) logs.addLog(error.toString());
			$('#modalSetup').modal('hide');
			$('#modalSetupError').modal('show');
		}

		var timeoutID = window.setTimeout(setupError, 10000);

		var cur = 0;
		var len = 0;
		var tmpFile = userDir + '/tmp/dataserv-client.zip';
		fs.ensureDirSync(userDir + '/tmp');
		var tmpFileStream = fs.createWriteStream(tmpFile);
		tmpFileStream.on('open', function() {
			logs.addLog("Pinging " + window.env.dataservClientWindowsURL);
			request.get(window.env.dataservClientWindowsURL, {timeout: 15000})
			.on('response', function(response) {
				logs.addLog("Received response, downloading... ");
				window.clearTimeout(timeoutID);
				len = parseInt(response.headers['content-length'], 10);
			})
			.on('data', function(data) {
				cur += data.length;
				if(len !== 0) {
					statusObj.innerHTML = 'Downloading dataserv-client ' + '(' + (100.0 * cur / len).toFixed(2) + '%)';
				} else {
					statusObj.innerHTML = 'Downloading dataserv-client ' + '(' + (cur / 1048576).toFixed(2) + 'mb)';
				}
			})
			.on('error', setupError)
			.pipe(tmpFileStream);

			tmpFileStream.on('finish', function() {
				tmpFileStream.close(function() {
					statusObj.innerHTML = 'Download complete, installing';
					logs.addLog("Download complete, extracting " + tmpFile);
					fs.createReadStream(tmpFile)
					.pipe(unzip.Extract({ path: userDir })
					.on('close', function() {
						fs.unlink(tmpFile);
						fs.remove(userDir + '/tmp');
						userData.dataservClient = userDir + '/dataserv-client/dataserv-client.exe';
						logs.addLog("Extraction complete, validating dataserv-client.exe");
						requirejs('./modules/process').validateDataservClient(function(output) {
							if(output) {
								logs.addLog(output.toString());
							}
							$('#modalSetup').modal('hide');
							userData.save();
						});
					}));
				});
			});
		});
	} else if(os.platform() === 'darwin' /*OSX*/) {
		/* TODO */
	} else if(os.platform() === 'linux') {
		/* TODO */
	}
};

exports.init = function() {
	requirejs('./modules/process').validateDataservClient(function(error) {
		if(error) {
			if(os.platform() === 'win32') {
				$('#modalSetup').modal('show');
				downloadDataservClient();
			} else {
				$('#modalSetupUnsupported').modal('show');
			}
		}
	});
};
