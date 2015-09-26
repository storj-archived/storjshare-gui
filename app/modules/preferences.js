/* global $ */
/* global w2ui */
/* global w2popup */
/* global requirejs */

'use strict';

var remote = require('remote');
var app = remote.require('app');
var dialog = remote.require('dialog');
var ipc = require("electron-safe-ipc/guest");

exports.initPreferences = function() {
	ipc.on('openPreferencesPopup', exports.openPreferencesPopup);
}

exports.openPreferencesPopup = function() {
	if ($('#w2ui-popup').length == 0) {

		var userData = requirejs('./app').userData;

		if(w2ui.preferencesPopup) {
			w2ui.preferencesPopup.record.dataservClient = userData.dataservClient;
			w2ui.preferencesPopup.record.payoutAddress = userData.payoutAddress;
			w2ui.preferencesPopup.record.dataservDirectory = userData.dataservDirectory;
			w2ui.preferencesPopup.record.dataservSize = userData.dataservSize;
		} else {
			$().w2form({
				showClose : false,
				showMax   : false,
				name: 'preferencesPopup',
				style: 'border: 0px; background-color: transparent;',
				formHTML: 
					'<div class="w2ui-page page-0">'+
					'    <div class="w2ui-field">'+
					'        <label>Payout Address:</label>'+
					'        <div>'+
					'            <input name="payoutAddress" type="text" maxlength="100" style="width: 250px"/>'+
					'        </div>'+
					'    </div>'+
					'    <div class="w2ui-field">'+
					'        <label>Storj Directory:</label>'+
					'        <div>'+
					'           <input name="dataservDirectory" type="text" maxlength="256" style="width: 250px"/>'+
					'           <button name="browseDataservDirectory" class="btn"">Browse</button>'+
					'        </div>'+
					'    </div>'+
					'    <div class="w2ui-field">'+
					'        <label>Size (<a href="https://github.com/Storj/dataserv-client#farmer-quickstart-guide" class="js-external-link">more info</a>):</label>'+
					'        <div>'+
					'            <input name="dataservSize" type="text" maxlength="100" style="width: 250px"/>'+
					'        </div>'+
					'    </div>'+
					'</div>'+
					'<div class="w2ui-buttons">'+
					'    <button class="btn" name="save">Save</button>'+
					'</div>',
				fields: [
					{ field: 'payoutAddress', type: 'text', required: true },
					{ field: 'dataservDirectory', type: 'text', required: false },
					{ field: 'dataservSize', type: 'text', required: false }
				],
				record: {
					payoutAddress: userData.payoutAddress,
					dataservDirectory: userData.dataservDirectory,
					dataservSize: userData.dataservSize,
				},
				actions: {
					"save": function () {
						userData.dataservDirectory = $('#dataservDirectory').val();
						userData.dataservSize = $('#dataservSize').val();
						userData.payoutAddress = $('#payoutAddress').val();
						this.validate();
					},
					"browseDataservClient" : function() {
						dialog.showOpenDialog({ 
							title: 'Please select dataserv-client executable',
							defaultPath: app.getPath('userDesktop'),
							properties: [ 'openFile' ]
						}, function(path) {
							if(path !== undefined && path !== "") {
								$('#dataservClient').val(path);
							}
						});
					},
					"browseDataservDirectory" : function() {
						dialog.showOpenDialog({ 
							title: 'Please select directory',
							defaultPath: app.getPath('userDesktop'),
							properties: [ 'openDirectory' ]
						}, function(path) {
							if(path !== undefined && path !== "") {
								$('#dataservDirectory').val(path);
							}
						});
					}
				},
				onValidate: function(event) {
					var app = requirejs('./app');
					var grid = requirejs('./modules/grid');
					if(app.hasValidSettings()) {
						app.saveSettings();
						$().w2popup('close');
					}
				}
			});
		}
		// popup form
		$().w2popup('open', {
			title   : 'Preferences',
			body    : '<div id="form" style="width: 100%; height: 100%;"></div>',
			style   : 'padding: 15px 0px 0px 0px',
			width   : 500,
			height  : 235	,
			modal   : true,
			 onToggle: function (event) {
				$(w2ui.preferencesPopup.box).hide();
				event.onComplete = function () {
					$(w2ui.preferencesPopup.box).show();
					w2ui.preferencesPopup.resize();
				}
			},
			onOpen: function (event) {
				event.onComplete = function () {
					// specifying an onOpen handler instead is equivalent to specifying an onBeforeOpen handler, which would make this code execute too early and hence not deliver.
					$('#w2ui-popup #form').w2render('preferencesPopup');
				}
			}
		});
	}
}