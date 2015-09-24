/* global $ */
/* global w2ui */
/* global w2popup */
/* global w2alert */
/* global requirejs */

'use strict';

var os = require('os');

var downloadDataservClient = function() {

	var userData = requirejs('./app').userData;
	var statusObj = document.getElementById('setup-status');

	if(os.platform() === 'win32') {

		statusObj.innerHTML = 'Connecting to server...';

		var fs = require('fs-extra');
		var unzip = require('unzip');
		var remote = require('remote');
		var app = remote.require('app');
		var request = require('request');
		var userDir = app.getPath('userData');

		var cur = 0;
		var len = 0;
		var tmpFile = userDir + '/tmp/dataserv-client.zip';
		fs.ensureDirSync(userDir + '/tmp');
		var tmpFileStream = fs.createWriteStream(tmpFile);
		tmpFileStream.on('open', function() {
			request.get(window.env.dataservClientWindowsURL, {timeout: 1500})
			.on('response', function(response) {
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
					w2confirm('Connection Timeout', function (btn) { 
						console.log(btn);
						if(btn === 'Yes') {
							downloadDataservClient();
						} else {
							w2popup.close();
						}
					});
				} else {
					w2alert(error.toString(), "Error");
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
						w2popup.close();
						requirejs('./modules/process').validateDataservClient(function(error) {
							if(error) {
								w2alert(error.toString(), "Error");
							}
						});
					}));
				});
			});
		});
	} else if(os.platform() === 'darwin' /*OSX*/) {
		statusObj.innerHTML = 'Installing dataserv-client...';

		/*
		var fs = require('fs'),
		spawn = require('child_process').spawn,
		out = fs.openSync('./out.log', 'a'),
		err = fs.openSync('./out.log', 'a');

		var child = spawn('prg', [], {
			detached: true,
			stdio: [ 'ignore', out, err ]
		});
		*/

		var sudo = require('sudo-prompt');
		sudo.setName('DriveShare');

		w2alert("When you click Ok you will be prompted for your credentials in order to install XCode, please install XCode before proceeding.", "You Need to Install XCode", function() {
			sudo.exec('xcode-select --install', function(error, out) {
				console.log(out);
				if(error) {
					console.log(error);
					w2alert(error.toString(), "Error", function() { w2popup.close(); });
				} else {
					sudo.exec('easy_install pip', function(error, out) {
						console.log(out);
						if(error) {
							console.log(error);
							w2alert(error.toString(), "Error", function() { w2popup.close(); });
						} else {
							sudo.exec('pip install dataserv-client', function(error, out) {
								console.log(out);
								if(error) {
									console.log(error);
									w2alert(error.toString(), "Error", function() { w2popup.close(); });
								} else {
									userData.dataservClient = 'dataserv-client';
									w2popup.close();
								}
							});
						}
					});
				}
			});
		});
		//rehash

	} else if(os.platform() === 'linux') {
		statusObj.innerHTML = 'Installing dataserv-client...';
		
		var sudo = require('sudo-prompt');
		sudo.setName('DriveShare');
	}
};

exports.initSetup = function() {
	
	var process = requirejs('./modules/process');
	process.validateDataservClient(function(error) {
		if(error) {
			var body;
			var buttons;
			var width;
			var height;
			if(os.platform() === 'win32') {
				body = '<div id="setup-status" class="w2ui-centered" style="position: relative; top: 10px;"></div>' + 
						'<div class="w2ui-centered" style="position: absolute; top: 85px;">Performing first time initialization, please wait.</div>';
				width = 350;
				height = 150;
			} else if(os.platform() === 'darwin') {
				body = '<div class="w2ui-centered" style="position: absolute; top: 85px;">Automatic setup of <strong>dataserv-client</strong> is not yet supported on OSX, please follow the instructions on <a href="http://driveshare.org/dataserv.html" class="js-external-link">this page</a> to install <strong>dataserv-client</strong>. Reload DriveShare when installation is complete.</div>';
				buttons = '<button class="btn" onclick="location.reload();">Reload</button>';
				width = 350;
				height = 250;
			} else if(os.platform() === 'linux') {
				body = '<div class="w2ui-centered" style="position: absolute; top: 85px;">Automatic setup of <strong>dataserv-client</strong> is not yet supported on Linux, please follow the instructions on <a href="http://driveshare.org/dataserv.html" class="js-external-link">this page</a> to install <strong>dataserv-client</strong>. Reload DriveShare when installation is complete.</div>';
				buttons = '<button class="btn" onclick="location.reload();">Reload</button>';
				width = 350;
				height = 250;
			}

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
								w2popup.lock('', true);
								downloadDataservClient();
							}
						} catch(error) {
							w2popup.close();
							w2alert(error.toString(), "Error");
						}
					}
				},
				onClose: function(event) {
					event.onComplete = function() { requirejs('./modules/preferences').openPreferencesPopup(); };
				}
			});
		} else if(!requirejs('./app').hasValidSettings()) {
			requirejs('./modules/preferences').openPreferencesPopup();	
		}
	});
};
