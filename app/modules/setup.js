/* global $ */
/* global w2ui */
/* global w2popup */
/* global w2alert */
/* global requirejs */

'use strict';

var os = require('os');
var fs = require('fs-extra');
var unzip = require('unzip');
var remote = require('remote');
var app = remote.require('app');
var request = require('request');

var downloadDataservClient = function() {

	var statusObj = document.getElementById('setup-status');
	var userData = requirejs('./app').userData;
	var userDir = app.getPath('userData');

	if(os.platform() === 'win32') {
		var cur = 0;
		var len = 0;
		var tmpFile = userDir + '/tmp/dataserv-client.zip';

		fs.ensureDirSync(userDir + '/tmp');
		var tmpFileStream = fs.createWriteStream(tmpFile);
		tmpFileStream.on('open', function() {

			request.get(window.env.dataservClientWindowsURL)
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
				w2popup.close();
				w2alert(error.toString(), "Error");
			})
			.pipe(tmpFileStream);

			tmpFileStream.on('finish', function() {
				tmpFileStream.close(function() {
					statusObj.innerHTML = 'Download complete, extracting...';
					fs.createReadStream(tmpFile).pipe(unzip.Extract({ path: userDir }).on('close', function() {
						statusObj.innerHTML = 'Done!';
						fs.unlink(tmpFile);
						fs.remove(userDir + '/tmp');
						userData.dataservClient = userDir + '/dataserv-client/dataserv-client.exe';
						requirejs('./modules/process').validateDataservClient(function(error) {
							if(error) {
								w2popup.close();
								w2alert(error.toString(), "Error");
							} else {
								window.setTimeout(function() { w2popup.close(); }, 1000);
							}
						});
					}));
				});
			});
		});
	} else if(os.platform() === 'darwin' /*OSX*/) {

	} else if(os.platform() === 'linux') {

	}
};

exports.initSetup = function() {
	
	var userData = requirejs('./app').userData;
	if(!userData.dataservClient) {
		w2popup.open({
			title     : 'Welcome to DataShare',
			body      : '<div id="setup-status" class="w2ui-centered" style="position: relative; top: 10px;">Connecting to server</div>' + 
						'<div class="w2ui-centered" style="position: absolute; top: 85px;">Performing first time initialization, please wait.</div>',
			width     : 300,
			height    : 150,
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
						w2popup.lock('', true);
						downloadDataservClient();
					} catch(error) {
						w2popup.close();
						w2alert(error.toString(), "Error");
					}
				}
			},
			onClose   : function (event) { window.setTimeout(function() { requirejs('./modules/preferences').openPreferencesPopup(); }, 350);  },
			onKeydown : function (event) { window.setTimeout(function() { requirejs('./modules/preferences').openPreferencesPopup(); }, 350);  }
		});
	}
};
