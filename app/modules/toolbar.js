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
			{ type: 'button',  id: 'farm',  caption: 'Farm', icon: 'fa fa-cogs' },
			{ type: 'button',  id: 'cancel',  caption: 'Cancel', icon: 'fa fa-ban' },
			{ type: 'spacer',  id: 'spacer0' },
			{ type: 'button',  id: 'register',  caption: 'Register', icon: 'fa fa-user-plus' },
			{ type: 'button',  id: 'build',  caption: 'Build', icon: 'fa fa-wrench' },
			{ type: 'button',  id: 'poll',  caption: 'Poll', icon: 'fa fa-cloud-upload' },
		],
		onClick: function (event) {
			switch (event.target) {
				case 'settings':
					$(document).trigger('openPreferencesPopup');
					break;
				case 'farm':
					$(document).trigger('clearGridRecords');
					$(document).trigger('terminateProcess');
					$(document).trigger('farm', [
						function (output) {
							$(document).trigger('addGridRecord', output.toString());
						}
					]);
					break;
				case 'build':
					$(document).trigger('clearGridRecords');
					$(document).trigger('terminateProcess');
					$(document).trigger('build', [
						function (output) {
							$(document).trigger('addGridRecord', output.toString());
						}
					]);
					break;
				case 'register':
					$(document).trigger('clearGridRecords');
					$(document).trigger('terminateProcess');
					$(document).trigger('register', [
						function (output) {
							$(document).trigger('addGridRecord', output.toString());
						}
					]);
					break;
				case 'poll':
					$(document).trigger('clearGridRecords');
					$(document).trigger('terminateProcess');
					$(document).trigger('poll', [
						function (output) {
							$(document).trigger('addGridRecord', output.toString());
						}
					]);
					break;
				case 'cancel':
					$(document).trigger('clearGridRecords');
					$(document).trigger('terminateProcess');
					break;
			}
		}
	});
};