/* global $ */

'use strict';

var remote = require('remote');
var app = remote.require('app');
var dialog = remote.require('dialog');

exports.initToolbar = function() {
	
	$('#toolbar').w2toolbar({
		name: 'toolbar',
		items: [
			{ type: 'button', id: 'settings', caption: 'Preferences', icon: 'fa fa-cog' },
			{ type: 'button',  id: 'farm',  caption: 'Farm', icon: 'fa fa-cogs' },
			{ type: 'button',  id: 'cancel',  caption: 'Cancel', icon: 'fa fa-ban' },
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
				case 'cancel':
					$(document).trigger('clearGridRecords');
					$(document).trigger('terminateProcess');
					break;
			}
		}
	});
};