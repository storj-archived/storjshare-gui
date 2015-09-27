/* global $ */
/* global w2ui */
/* global w2alert */
/* global requirejs */

'use strict';

var app;
var userData;
var process;
var preferences;

exports.initLayout = function() {

	app = requirejs('./app');
	userData = app.userData;
	process = requirejs('./modules/process');
	preferences = requirejs('./modules/preferences');

	$('#layout').w2layout({
		name: 'layout',
		panels: [
			{ type: 'main', style: 'border: 1px solid #dfdfdf; padding: 5px; border-top: 0px;', content: '<div id="content" class="w2ui-centered"></div>', 
				toolbar: {
				name: "toolbar",
				items: [
					{ type: 'button',  id: 'action',  caption: 'Start', icon: 'fa fa-cloud-upload' },
					{ type: 'spacer', id: 'spacer' },
					{ type: 'button', id: 'preferences', caption: 'Preferences', icon: 'fa fa-cog' }
				],
				onClick: function (event) {
					switch (event.target) {
						case 'action':
							if(process.child) {
								process.terminateProcess();
							} else {
								process.farm();
							}
							break;
						case 'preferences':
							preferences.openPreferencesPopup();
							break;
					}
				}
			}
		}]
	});

	app.checkCurrentUserSJXC();
	exports.refresh();
};

exports.refresh = function() {
	exports.refreshContent();
	exports.refreshToolbar();
};

exports.refreshContent = function() {
	var content = $("#content");
	if(content) {
		if(app.hasValidSettings()) {
			var sjxAmount = (app.currentSJXC) ? ("<br>Current SJCX: <b>" + app.currentSJXC + "</b>") : "";
			var currentAction = (process.currentProcess) ? ("<br><b>" + process.currentProcess + "</b>") : "";
			content.html("Serving <b>" + userData.dataservSize +
						 "</b> at <b>" + userData.dataservDirectory + "</b><br>" +
						 "Payout Address: <b>" + userData.payoutAddress + "</b>" + sjxAmount + currentAction);
		} else {
			content.html("Missing data, please check your preferences");
		}
	}
};

exports.refreshToolbar = function() {
	var toolbar = w2ui["layout_main_toolbar"];
	if(toolbar) {
		if(requirejs('./modules/process').child) {
			toolbar.set('action', { caption: 'Stop', icon: 'fa fa-ban' });
			toolbar.disable('preferences');
		} else {
			toolbar.set('action', { caption: 'Start', icon: 'fa fa-cloud-upload' });
			toolbar.enable('preferences');
		}
		toolbar.refresh();
	}
};
