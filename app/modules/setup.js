/* global $ */
/* global requirejs */

'use strict';

var os = require('os');

var downloadDataservClient = function() {

	var platform = os.platform();
	var userData = requirejs('./modules/userdata');
	var statusObj = document.getElementById('setupStatus');
	statusObj.innerHTML = 'Connecting to server';
	
	// convert platform to match text present in dataserv-client release files
	if(platform === 'darwin') {
		platform = 'osx32';
	}

	var fs = require('fs-extra');
	var AdmZip = require('adm-zip');
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
					statusObj.innerHTML = 'Download complete, installing';
					logs.addLog("Download complete, extracting " + tmpFile);
					
					tmpFileStream.close(function() {
						var zipFile = new AdmZip(tmpFile);
						zipFile.extractAllTo(userDir, true);
						fs.remove(userDir + '/tmp');
						
						switch(os.platform()) {
							case 'win32': userData.dataservClient = userDir + '/dataserv-client/dataserv-client.exe'; break;
							case 'darwin': userData.dataservClient = userDir + '/dataserv-client.app/Contents/MacOS/dataserv-client'; break;
							case 'linux': userData.dataservClient = userDir + '/dataserv-client'; break;
						}
						
						// mark file as executable on non-windows platforms
						if(os.platform() !== 'win32') {
							fs.chmodSync(userData.dataservClient, 755);
						}
						
						logs.addLog("Extraction complete, validating dataserv-client");
						requirejs('./modules/process').validateDataservClient(function(output) {
							if(output) {
								logs.addLog(output.toString());
							}
							$('#modalSetup').modal('hide');
							userData.save();
						});
					});
				});
			});
		} else {
			setupError(error);
		}
	});
}

exports.setupLinux = function(password) {
	var exec = require('child_process').exec;
	var logs = requirejs('./modules/logs');
	var userData = requirejs('./modules/userdata');
	var statusObj = document.getElementById('setupStatus');

	$('#modalSetup').modal('show');
	$('#modalSetupLinux').modal('hide');

	var setupError = function(error) {
		logs.addLog(error.toString());
		$('#modalSetup').modal('hide');
		$('#modalSetupErrorLinux').modal('show');
	}

	// HAX: Store user password from input element to gain sudo permission
	var password = $("#linuxPassword").val();

	logs.addLog("Installing python3-pip");
	statusObj.innerHTML = 'Installing python3-pip';
	exec('echo ' + password + ' | sudo -S apt-get install python3-pip', function(error, stdout, stderr) {
		if(error) {
			setupError(error);
		} else {
			logs.addLog(stdout);
			logs.addLog("Installing dataserv-client");
			statusObj.innerHTML = 'Installing dataserv-client';
			exec('echo ' + password + ' | sudo -S pip3 install dataserv-client', function(error, stdout, stderr) { 
				if(error) {
					setupError(error);
				} else {
					logs.addLog(stdout);
					logs.addLog("Setup complete, validating dataserv-client");
					statusObj.innerHTML = 'Validating dataserv-client';
					userData.dataservClient = "dataserv-client";
					requirejs('./modules/process').validateDataservClient(function(output) {
						$('#modalSetup').modal('hide');
						if(output) {
							logs.addLog(output.toString());
							$('#modalSetupErrorLinux').modal('show');
						} else {
							userData.save();
						}
					});
				}
			});
		}
	});
}

exports.init = function() {
	requirejs('./modules/process').validateDataservClient(function(error) {
		if(error) {
			if(os.platform() === 'linux') {
				$('#modalSetupLinux').modal('show');
				$('#modalSetupLinux').on('shown.bs.modal', function () {
					$('#linuxPassword').focus();
					$('#linuxPassword').keypress(function (e) {
						if (e.which == 13) {
							exports.setupLinux();
							return false;
						}
					});
				});
			} else {
				$('#modalSetup').modal('show');
				downloadDataservClient();
			}
		}
	});
};
