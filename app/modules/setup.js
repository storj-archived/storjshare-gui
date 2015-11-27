/* global $ */
/* global requirejs */

'use strict';

var async = require('async');
var os = require('os');
var userData = require('./userdata');
var process = require('./process');
var platform = os.platform();
var statusObj = document.getElementById('setupStatus');
var fs = require('fs-extra');
var AdmZip = require('adm-zip');
var remote = require('remote');
var app = remote.require('app');
var request = require('request');
var userDir = app.getPath('userData');
var logs = require('./logs');
var exec = require('child_process').exec;
var logs = require('./logs');
var userData = require('./userdata');
var statusObj = document.getElementById('setupStatus');

/**
 * Downloads the dataserv-client program
 * #downloadDataservClient
 */
function downloadDataservClient() {
	statusObj.innerHTML = 'Connecting to server';

	// convert platform to match text present in dataserv-client release files
	if(platform === 'darwin') {
		platform = 'osx32';
	}

	function setupError(error) {
		if (error) {
			logs.addLog(error.toString());
		}

		$('#modalSetup').modal('hide');
		$('#modalSetupError').modal('show');
	}

	var options = {
		url: window.env.dataservClientURL,
		headers: { 'User-Agent': 'Storj' }
	};

	var timeoutID = window.setTimeout(setupError, 10000);

	logs.addLog('Obtaining download URL for dataserv-client');

	request.get(options, function (error, response, body) {
		window.clearTimeout(timeoutID);

		if (!error && response.statusCode == 200) {
			var json = JSON.parse(body);
			var dataservClientDownloadURL = null;

			for (var i = 0; i < json.assets.length; ++i) {
				if (json.assets[i].name.indexOf(platform) !== -1) {
					dataservClientDownloadURL = json.assets[i].browser_download_url;
					break;
				}
			}

			if (!dataservClientDownloadURL) {
				setupError('Could not obtain dataserv-client download URL for ' + platform + ' platform');
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

				request.get(dataservClientDownloadURL, {
					timeout: 15000
				}).on('response', function(response) {
					window.clearTimeout(timeoutID);
					len = parseInt(response.headers['content-length'], 10);
				}).on('data', function(data) {
					cur += data.length;
					if (len !== 0) {
						statusObj.innerHTML = 'Downloading dataserv-client ' + '(' + (100.0 * cur / len).toFixed(2) + '%)';
					} else {
						statusObj.innerHTML = 'Downloading dataserv-client ' + '(' + (cur / 1048576).toFixed(2) + 'mb)';
					}
				}).on('error', setupError).pipe(tmpFileStream);

				tmpFileStream.on('finish', function() {
					statusObj.innerHTML = 'Download complete, installing';

					logs.addLog("Download complete, extracting " + tmpFile);

					tmpFileStream.close(function() {
						var zipFile = new AdmZip(tmpFile);

						zipFile.extractAllTo(userDir, true);
						fs.remove(userDir + '/tmp');

						switch(platform) {
							case 'win32': userData.dataservClient = userDir + '/dataserv-client/dataserv-client.exe'; break;
							case 'osx32': userData.dataservClient = userDir + '/dataserv-client.app/Contents/MacOS/dataserv-client'; break;
							case 'linux': userData.dataservClient = userDir + '/dataserv-client'; break;
						}

						// mark file as executable on non-windows platforms
						if (platform !== 'win32') {
							fs.chmodSync(userData.dataservClient, 755);
						}

						logs.addLog("Extraction complete, validating dataserv-client");

						require('./process').validateDataservClient(userData.dataservClient, function(output) {
							userData.save();
							$('#modalSetup').modal('hide');

							if (output) {
								logs.addLog(output);

								if (output.toLowerCase().indexOf('error') !== -1) {
									if (platform === 'win32') {
										$("#modalValidateErrorWindows").modal('show');
									} else {
										$("#modalValidateError").modal('show');
									}
								}
							}
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
	$('#modalSetup').modal('show');
	$('#modalSetupLinux').modal('hide');

	function setupError(error) {
		logs.addLog(error.toString());
		$('#modalSetup').modal('hide');
		$('#modalSetupErrorLinux').modal('show');
	}

	// HAX: Store user password from input element to gain sudo permission
	var password = $("#linuxPassword").val();

	async.waterfall(
		[
			checkInstalled('pip'),
			installPip,
			checkInstalled('dataserv-client'),
			installDataservClient,
			validateDataservClient
		],
		function(err) {
			$('#modalSetup').modal('hide');

			if (err) {
				logs.addLog(err.toString());
				return;
			}

			userData.save();
		}
	);

	function which(program, callback) {
		exec('which ' + program, function(err, stdout, stderr) {
			if (err) {
				return callback(err);
			}

			callback(null, stdout);
		});
	}

	function checkInstalled(path) {
		return function(done) {
			which(path, done);
		}
	}

	function installPip(path, callback) {
		if (path) {
			return callback();
		}

		logs.addLog("Installing python-pip");
		statusObj.innerHTML = 'Installing python-pip';

		exec('echo ' + password + ' | sudo -S apt-get install python-pip', function(err, stdout, stderr) {
			password = null;

			if (err) {
				return callback(err);
			}

			logs.addLog(stdout);
			callback()
		});
	}

	function installDataservClient(path, callback) {
		if (path) {
			return callback();
		}

		logs.addLog("Installing dataserv-client");
		statusObj.innerHTML = 'Installing dataserv-client';

		exec('echo ' + password + ' | sudo -S pip install dataserv-client', function(err, stdout, stderr) {
			if (err) {
				return callback(err);
			}

			logs.addLog(stdout);
			callback();
		});
	}

	function validateDataservClient(callback) {
		logs.addLog("Setup complete, validating dataserv-client");
		statusObj.innerHTML = 'Validating dataserv-client';
		userData.dataservClient = "dataserv-client";

		require('./process').validateDataservClient(callback);
	}
}

exports.init = function() {
	if (userData.hasValidDataservClient()){
		console.log(userData.dataservClient)
		process.validateDataservClient(userData.dataservClient,function(error) {
			if (error) {
				canDownloadClient(os);
			}
		});
	} else {
		canDownloadClient(os);
	}
};

function canDownloadClient(os) {
  if (os.platform() === "linux") {
    $("#modalSetupLinux").modal("show");
    $("#modalSetupLinux").on("shown.bs.modal", function() {
      $("#linuxPassword").focus();
      $("#linuxPassword").keypress(function(e) {
        if (e.which == 13) {
          exports.setupLinux();
          return false
        }
      });
    });
  } else {
    $("#modalSetup").modal("show");
    downloadDataservClient()
  }
}
