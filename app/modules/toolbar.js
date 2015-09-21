/* global $ */

'use strict';

var remote = require('remote');
var app = remote.require('app');
var dialog = remote.require('dialog');

exports.initToolbar = function() {
	
	var btnCount = 0;
	$('#toolbar').w2toolbar({
		name: 'toolbar',
		items: [
			{ type: 'button', id: 'settings', caption: 'Preferences', icon: 'fa fa-cog' },
			{ type: 'break',  id: 'break0' },
			{ type: 'button',  id: 'build',  caption: 'Build', icon: 'fa fa-wrench' },
			{ type: 'button',  id: 'register',  caption: 'Register', icon: 'fa fa-user-plus' },
			{ type: 'button',  id: 'poll',  caption: 'Poll', icon: 'fa fa-cloud-upload' },
		],
		onClick: function (event) {
			switch (event.target) {
				case 'settings':
					$(document).trigger('openPreferencesPopup');
					break;
				case 'build':
					$(document).trigger('terminateProcess');
					$(document).trigger('clearGridRecords');
					$(document).trigger('build', [
						function (output) {
							$(document).trigger('addGridRecord', output.toString());
						}
					]);
					break;
				case 'register':
					$(document).trigger('terminateProcess');
					$(document).trigger('clearGridRecords');
					$(document).trigger('register', [
						function (output) {
							$(document).trigger('addGridRecord', output.toString());
						}
					]);
					break;
				case 'poll':
					$(document).trigger('terminateProcess');
					$(document).trigger('clearGridRecords');
					$(document).trigger('poll', [
						function (output) {
							$(document).trigger('addGridRecord', output.toString());
						}
					]);
					break;
			}
		}
	});
};