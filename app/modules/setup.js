/* global $ */
/* global requirejs */

'use strict';

var os = require('os');

var downloadDataservClient = function() {

	var platform = os.platform();
	var userData = requirejs('./modules/userdata');
	var statusObj = document.getElementById('setupStatus');
	
	// convert platform strings to match platform text present in dataserv-client release files
	switch(platform) {
		case 'darwin': platform = 'osx32'; break;
		case 'linux': platform = 'debian32'; break;
	}

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
	
	var options = {
		url: window.env.dataservClientURL,
		headers: { 'User-Agent': 'Storj' }
	};

	var timeoutID = window.setTimeout(setupError, 10000);
	logs.addLog("Obtaining download URL for dataserv-client");
	request.get(options, function (error, response, body) {
		window.clearTimeout(timeoutID);
		if (!error && response.statusCode == 200) {
			var json = JSON.parse(body);
			var dataservClientDownloadURL = null;
			for(var i = 0; i < json.assets.length; ++i) {
				if(json.assets[i].name.indexOf(platform) !== -1) {
					dataservClientDownloadURL = json.assets[i].browser_download_url;
					break;
				}
			}
			if(!dataservClientDownloadURL) {
				setupError("Could not obtain dataserv-client download URL for " + platform + " platform");
				return;
			}
			
			var cur = 0;
			var len = 0;
			var tmpFile = userDir + '/tmp/dataserv-client.zip';
			fs.ensureDirSync(userDir + '/tmp');
			var tmpFileStream = fs.createWriteStream(tmpFile);
			tmpFileStream.on('open', function() {
				timeoutID = window.setTimeout(setupError, 10000);
				logs.addLog("Downloading " + dataservClientDownloadURL);
				request.get(dataservClientDownloadURL, {timeout: 15000})
				.on('response', function(response) {
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
		} else {
			setupError(error);
		}
	});
};

exports.init = function() {
	requirejs('./modules/process').validateDataservClient(function(error) {
		if(error) {
			$('#modalSetup').modal('show');
			downloadDataservClient();
		}
	});
};
