/* global $ */
/* global requirejs */

'use strict';

var os = require('os');

var downloadDataservClient = function() {

	var userData = requirejs('./modules/userdata');
	var statusObj = document.getElementById('setup-status');

	if(os.platform() === 'win32') {

		statusObj.innerHTML = 'Connecting to server...';

		var fs = require('fs-extra');
		var unzip = require('unzip');
		var remote = require('remote');
		var app = remote.require('app');
		var request = require('request');
		var userDir = app.getPath('userData');

		var timeoutID = window.setTimeout(function() {
			require('dialog').showMessageBox({
				type: 'error',
				buttons: [ 'Reload' ],
				title: 'New Update Available',
				message: 'There was an issue downloading dataserv-client. If this issue persists, try running the program as an administrator, or <a href="https://github.com/Storj/driveshare-gui/issues">post an issue on github</a>.'
				},
				function(response) {
					location.reload();
				}
			);
		}, 15000);

		var cur = 0;
		var len = 0;
		var tmpFile = userDir + '/tmp/dataserv-client.zip';
		fs.ensureDirSync(userDir + '/tmp');
		var tmpFileStream = fs.createWriteStream(tmpFile);
		tmpFileStream.on('open', function() {
			request.get(window.env.dataservClientWindowsURL, {timeout: 15000})
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
			.on('error', function(error) {
				if(error.code === 'ETIMEDOUT') {
					require('dialog').showMessageBox({
						type: 'question',
						buttons: [ 'Reload', 'Close' ],
						title: 'Error',
						message: 'Connection Timout'
						},
						function(response) {
							if(response === 'Reload') {
								location.reload();
							}
						}
					);
				} else {
					console.log(error.toString());
				}
			})
			.pipe(tmpFileStream);

			tmpFileStream.on('finish', function() {
				tmpFileStream.close(function() {
					statusObj.innerHTML = 'Download complete, installing...';
					fs.createReadStream(tmpFile)
					.pipe(unzip.Extract({ path: userDir })
					.on('close', function() {
						fs.unlink(tmpFile);
						fs.remove(userDir + '/tmp');
						userData.dataservClient = userDir + '/dataserv-client/dataserv-client.exe';
						requirejs('./modules/process').validateDataservClient(function(error) {
							if(error) {
								console.log(error.toString());
							}
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
	
	var process = requirejs('./modules/process');
	var userData = requirejs('./modules/userdata');
	
	process.validateDataservClient(function(error) {
		if(error) {
			var body;
			var buttons;
			var width;
			var height;
			if(os.platform() === 'win32') {
				body = 'Performing first time initialization, please wait.';
			} else if(os.platform() === 'darwin') {
				body = 'Automatic setup of <strong>dataserv-client</strong> is not yet supported on OSX, please <a href="http://driveshare.org/dataserv.html" class="js-external-link">follow the instructions on this page</a> to install <strong>dataserv-client</strong>. Reload DriveShare when installation is complete.';
				buttons = '<button class="btn" onclick="location.reload();">Reload</button>';
			} else if(os.platform() === 'linux') {
				body = 'Automatic setup of <strong>dataserv-client</strong> is not yet supported on Linux, please <a href="http://driveshare.org/dataserv.html" class="js-external-link">follow the instructions on this page</a> to install <strong>dataserv-client</strong>. Reload DriveShare when installation is complete.';
				buttons = '<button class="btn" onclick="location.reload();">Reload</button>';
			}
			
			$('#modalSetup').modal('show');

			w2popup.open({
				title     : 'Welcome to DriveShare',
				body      : body,
				buttons	  : buttons,
				width     : width,
				height    : height,
				overflow  : 'hidden',
				color     : '#333',
				speed     : '0.3',
				opacity   : '0.8',
				modal     : true,
				showClose : false,
				showMax   : false,
				onOpen: function (event) {
					event.onComplete = function () {
						try {
							if(os.platform() === 'win32') {
								downloadDataservClient();
							}
						} catch(error) {
							console.log(error.toString(), "Error", function() { /*close popup*/ });
						}
					}
				}
			});
		} else if(!userData.hasValidSettings()) {
			userData.openPreferencesPopup();
		}
	});
};
