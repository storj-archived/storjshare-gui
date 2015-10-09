exports.init = function() {
	ipc.on('checkForUpdates', exports.checkForUpdates);
}

exports.checkForUpdates = function(bSilentCheck) {
	try {
		request(pjson.config.versionCheckURL, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var json = JSON.parse(body);
				if(json.version > pjson.version) {
					require('dialog').showMessageBox({
						type: 'question',
						buttons: [ 'Yes', 'No' ],
						title: 'New Update Available',
						message: 'A new update is available. Would you like to update now?'
						},
						function(response) {
							if(response === 'Yes') {
								require('shell').openExternal('https://github.com/Storj/driveshare-gui/releases');
							}
						}
					);
				} else if(!bSilentCheck) {
					require('dialog').showMessageBox({
						title: 'Already Using the Latest Version',
						message: '<div class="w2ui-centered">No updates available.<br>' +
								 'You are already using the latest version.</div>' +
								 '<button class="btn" onclick="w2popup.close();">Close</button>' 
						}
					);
				}
			} else {
				console.log(error.toString());
			}
		})
	} catch(error) {
		console.log(error.toString());
	}
};