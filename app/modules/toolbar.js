/* global $ */

'use strict';

var remote = require('remote');
var app = remote.require('app');
var dialog = remote.require('dialog');

var openAddDirectoryPopup = function() {
	if ($('#w2ui-popup').length == 0) {
		console.log('openAddDirectoryPopup');
		$().w2form({
			showClose : false,
			showMax   : false,
			name: 'addDirectoryPopup',
			style: 'border: 0px; background-color: transparent;',
			formHTML: 
				'<div class="w2ui-page page-0">'+
				'    <div class="w2ui-field">'+
				'        <label>Directory:</label>'+
				'        <div>'+
				'           <input name="directoryPath" type="text" maxlength="256" style="width: 250px"/>'+
				'           <button name="browse" class="btn"">Browse</button>'+
				'        </div>'+
				'    </div>'+
				'    <div class="w2ui-field">'+
				'        <label>Size:</label>'+
				'        <div>'+
				'            <input name="directorySize" type="text" maxlength="100" style="width: 250px"/>'+
				'        </div>'+
				'    </div>'+
				'</div>'+
				'<div class="w2ui-buttons">'+
				'    <button class="btn" name="confirm">Confirm</button>'+
				'</div>',
			fields: [
				{ field: 'directoryPath', type: 'text', required: true },
				{ field: 'directorySize', type: 'text', required: true },
			],
			actions: {
				"confirm": function () {
					this.validate();
				},
				"browse" : function() {
					dialog.showOpenDialog({ 
						title: 'Please select directory',
						defaultPath: app.getPath('userDesktop'),
						properties: [ 'openDirectory' ]
					}, function(path) {
						if(path !== undefined && path !== "") {
							$('#directoryPath').val(path);
						}
					});
				}
			},
			onValidate: function(event) {
				var path = $('#directoryPath').val();
				var size = $('#directorySize').val();
				if(path !== undefined && path !== "" && size !== undefined && size !== "") {
					$(document).trigger('addDirectory', [path, size]);
					$().w2popup('close');
					$().w2popup('reset');
				}
			}
		});
		$().w2popup('open', {
			title   : 'Add Directory',
			body    : '<div id="form" style="width: 100%; height: 100%;"></div>',
			style   : 'padding: 15px 0px 0px 0px',
			width   : 500,
			height  : 200,
			modal   : true,
			 onToggle: function (event) {
				$(w2ui.addDirectoryPopup.box).hide();
				event.onComplete = function () {
					$(w2ui.addDirectoryPopup.box).show();
					w2ui.addDirectoryPopup.resize();
				}
			},
			onOpen: function (event) {
				event.onComplete = function () {
					// specifying an onOpen handler instead is equivalent to specifying an onBeforeOpen handler, which would make this code execute too early and hence not deliver.
					$('#w2ui-popup #form').w2render('addDirectoryPopup');
				}
			}
		});
	}
}

exports.initToolbar = function() {
	
	var btnCount = 0;
	$('#toolbar').w2toolbar({
		name: 'toolbar',
		items: [
			{ type: 'button', id: 'settings', caption: 'Preferences', icon: 'fa fa-wrench' },
			{ type: 'break',  id: 'break0' },
			{ type: 'button',  id: 'register',  caption: 'Register', icon: 'fa fa-flag' },
			{ type: 'button',  id: 'poll',  caption: 'Poll', icon: 'w2ui-icon-reload' },
			{ type: 'break',  id: 'break1' },
			{ type: 'button', id: 'add', caption: 'Add Directory', icon: 'w2ui-icon-plus' },
			//{ type: 'button', id: 'remove', caption: 'Remove Directory', icon: 'w2ui-icon-cross' },
		],
		onClick: function (event) {
			switch (event.target) {
				case 'add':
					openAddDirectoryPopup();
					break;
				case 'remove':
					//this.remove('button'+ btnCount);
					break;
				case 'settings':
					$(document).trigger('openPreferencesPopup');
					break;
				case 'register':
					$(document).trigger('register');
					break;
				case 'poll':
					$(document).trigger('poll');
					break;
			}
		}
	});
};