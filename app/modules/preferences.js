
/* global $ */
/* global w2ui */
/* global w2popup */

'use strict';

var fs = require('fs');
var remote = require('remote');
var app = remote.require('app');
var dialog = remote.require('dialog');
var ipc = require("electron-safe-ipc/guest");

var configFileName = "preferences.json";
var dataservClient = "";
var payoutAddress = "";
var dataservDirectory = "";
var dataservSize = "";
var userData = {};

var savePreferences = function() {
	try {
		userData.dataservClient = dataservClient;
		userData.dataservDirectory = dataservDirectory;
		userData.dataservSize = dataservSize;
		userData.payoutAddress = payoutAddress;
		var path = app.getPath('userData') + '/' + configFileName;
		fs.writeFileSync(path, JSON.stringify(userData) , 'utf-8');
		console.log('Saved preferences to \'' + path + '\'');
	} catch (err) {
		throw err;
	}
};

var openPreferencesPopup = function() {
	if ($('#w2ui-popup').length == 0) {
		if(w2ui.preferencesPopup) {
			w2ui.preferencesPopup.record.dataservClient = dataservClient;
			w2ui.preferencesPopup.record.payoutAddress = payoutAddress;
			w2ui.preferencesPopup.record.dataservDirectory = dataservDirectory;
			w2ui.preferencesPopup.record.dataservSize = dataservSize;
		} else {
			$().w2form({
				showClose : false,
				showMax   : false,
				name: 'preferencesPopup',
				style: 'border: 0px; background-color: transparent;',
				formHTML: 
					'<div class="w2ui-page page-0">'+
					'    <div class="w2ui-field">'+
					'        <label><a href="https://github.com/Storj/dataserv-client/releases" class="js-external-link">dataserv-client</a>:</label>'+
					'        <div>'+
					'           <input name="dataservClient" type="text" maxlength="256" style="width: 250px"/>'+
					'           <button name="browseDataservClient" class="btn"">Browse</button>'+
					'        </div>'+
					'    </div>'+
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
					{ field: 'dataservClient', type: 'text', required: true },
					{ field: 'payoutAddress', type: 'text', required: true },
					{ field: 'dataservDirectory', type: 'text', required: true },
					{ field: 'dataservSize', type: 'text', required: true }
				],
				record: {
					payoutAddress: payoutAddress,
					dataservClient: dataservClient,
					dataservDirectory: dataservDirectory,
					dataservSize: dataservSize,
				},
				actions: {
					"save": function () {
						dataservClient = $('#dataservClient').val();
						$(document).trigger('setDataservClient', dataservClient);

						dataservDirectory = $('#dataservDirectory').val();
						$(document).trigger('setDataservDirectory', dataservDirectory);

						dataservSize = $('#dataservSize').val();
						$(document).trigger('setDataservSize', dataservSize);

						payoutAddress = $('#payoutAddress').val();
						$(document).trigger('setPayoutAddress', payoutAddress);

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
					if( dataservClient !== undefined && dataservClient !== '' && payoutAddress !== undefined && payoutAddress !== '' &&
						dataservDirectory !== undefined && dataservDirectory !== '' && dataservSize !== undefined && dataservSize !== '' ) {
						savePreferences();
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
			height  : 275,
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

exports.initPreferences = function() {
	// load data from config file
	 try {
		//test to see if settings exist
		var path = app.getPath('userData') + '/' + configFileName;
		console.log('Reading settings from \'' + path + '\'');
		fs.openSync(path, 'r+'); //throws error if file doesn't exist
		var data = fs.readFileSync(path); //file exists, get the contents
		userData = JSON.parse(data); //turn to js object
		if(userData) {
			dataservClient = userData.dataservClient;
			$(document).trigger('setDataservClient', dataservClient);

			dataservDirectory = userData.dataservDirectory;
			$(document).trigger('setDataservDirectory', dataservDirectory);

			dataservSize = userData.dataservSize;
			$(document).trigger('setDataservSize', dataservSize);
			
			payoutAddress = userData.payoutAddress;
			$(document).trigger('setPayoutAddress', payoutAddress);
		}
	} catch (err) {
		//if error, then there was no settings file (first run).
		console.log(err.message);
	}
	
	// openPreferencesPopup if path to dataserv-client is not set
	if(!dataservClient) {
		w2popup.open({
			title     : 'Welcome to DataShare',
			body      : '<div class="w2ui-centered">You started DataShare for the first time, please set your preferences.</div>',
			buttons   : '<button class="btn" onclick="w2popup.close();">Set Preferences</button>',
			width     : 300,
			height    : 150,
			overflow  : 'hidden',
			color     : '#333',
			speed     : '0.3',
			opacity   : '0.8',
			modal     : true,
			showClose : false,
			showMax   : false,
			onClose   : function (event) { window.setTimeout(function() { openPreferencesPopup(); }, 350);  },
			onKeydown : function (event) { window.setTimeout(function() { openPreferencesPopup(); }, 350);  }
		});
	}

	$(document).on('savePrefrences', savePreferences);
	$(document).on('openPreferencesPopup', openPreferencesPopup);
	ipc.on('openPreferencesPopup', openPreferencesPopup);
};