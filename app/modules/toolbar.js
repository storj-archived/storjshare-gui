/* global $ */

'use strict';

exports.initToolbar = function() {

	var grid = requirejs('./modules/grid');
	var process = requirejs('./modules/process');
	var preferences = requirejs('./modules/preferences');
	
	var btnCount = 0;
	$('#toolbar').w2toolbar({
		name: 'toolbar',
		items: [
			{ type: 'button', id: 'settings', caption: 'Preferences', icon: 'fa fa-cog' },
			{ type: 'button',  id: 'start',  caption: 'Start', icon: 'fa fa-cloud-upload' },
			{ type: 'button',  id: 'stop',  caption: 'Stop', icon: 'fa fa-ban' },
		],
		onClick: function (event) {
			switch (event.target) {
				case 'settings':
					preferences.openPreferencesPopup();
					break;
				case 'start':
					grid.clear();
					process.terminateProcess();
					process.farm(function (output) { grid.insertRecord(output.toString()); });
					break;
				case 'stop':
					grid.clear();
					process.terminateProcess();
					break;
			}
		}
	});
};