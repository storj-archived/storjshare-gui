
/* global $ */
/* global w2ui */
/* global w2popup */

'use strict';

var fs = require('fs');
var remote = require('remote');
var app = remote.require('app');
var dialog = remote.require('dialog');
var ipc = require("electron-safe-ipc/guest");

var userData = {};
var payoutAddress = ""
var dataservRecords = [];
var dataservClientPath = "";
var dataservConfigFile = "preferences.json";

var savePreferences = function() {
	try {
		userData.payoutAddress = payoutAddress;
		userData.dataservRecords = dataservRecords;
		userData.dataservClientPath = dataservClientPath;
		var path = app.getPath('userData') + '/' + dataservConfigFile;
		fs.writeFileSync(path, JSON.stringify(userData) , 'utf-8');
		console.log('Saved preferences to \'' + path + '\'');
	} catch (err) {
		throw err;
	}
};

var addDirectory = function(event, path, size) {
	dataservRecords.push({ recid: dataservRecords.length, path: path, size: size, status: 'Ready'});
	$(document).trigger('setGridRecords', [dataservRecords]);
	savePreferences();
};

var openPreferencesPopup = function() {
	if ($('#w2ui-popup').length == 0) {
		console.log('openPreferencesPopup');
		$().w2form({
			showClose : false,
			showMax   : false,
			name: 'preferencesPopup',
			style: 'border: 0px; background-color: transparent;',
			formHTML: 
				'<div class="w2ui-page page-0">'+
				'    <div class="w2ui-field">'+
				'        <label>dataserv-client path:</label>'+
				'        <div>'+
				'           <input name="dataservClientPath" type="text" maxlength="256" style="width: 250px"/>'+
				'           <button name="browse" class="btn"">Browse</button>'+
				'        </div>'+
				'    </div>'+
				'    <div class="w2ui-field">'+
				'        <label>Payout Address:</label>'+
				'        <div>'+
				'            <input name="payoutAddress" type="text" maxlength="100" style="width: 250px"/>'+
				'        </div>'+
				'    </div>'+
				'</div>'+
				'<div class="w2ui-buttons">'+
				'    <button class="btn" name="save">Save</button>'+
				'</div>',
			fields: [
				{ field: 'dataservClientPath', type: 'text', required: true },
				{ field: 'payoutAddress', type: 'text', required: true },
			],
			record: {
				payoutAddress: payoutAddress,
				dataservClientPath: dataservClientPath,
			},
			actions: {
				"save": function () {
					dataservClientPath = $('#dataservClientPath').val();
					$(document).trigger('setDataservClientPath', dataservClientPath );

					payoutAddress = $('#payoutAddress').val();
					$(document).trigger('setPayoutAddress', payoutAddress);

					this.validate();
				},
				"browse" : function() {
					dialog.showOpenDialog({ 
						title: 'Please select dataserv-client executable',
						defaultPath: app.getPath('userDesktop'),
						properties: [ 'openFile' ]
					}, function(path) {
						if(path !== undefined && path !== "") {
							$('#dataservClientPath').val(path);
						}
					});
				}
			},
			onValidate: function(event) {
				if(dataservClientPath !== "" && payoutAddress !== "") {
					savePreferences();
					$().w2popup('close');
				}
			}
		});
		$().w2popup('open', {
			title   : 'Preferences',
			body    : '<div id="form" style="width: 100%; height: 100%;"></div>',
			style   : 'padding: 15px 0px 0px 0px',
			width   : 500,
			height  : 200,
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
		var path = app.getPath('userData') + '/' + dataservConfigFile;
		console.log('Reading settings from \'' + path + '\'');
		fs.openSync(path, 'r+'); //throws error if file doesn't exist
		var data = fs.readFileSync(path); //file exists, get the contents
		userData = JSON.parse(data); //turn to js object
		if(userData) {
			dataservClientPath = userData.dataservClientPath;
			$(document).trigger('setDataservClientPath', dataservClientPath);
			console.log('dataservClientPath initialized to \'' + dataservClientPath + '\'');

			payoutAddress = userData.payoutAddress;
			$(document).trigger('setPayoutAddress', payoutAddress);
			console.log('payoutAddress initialized to \'' + payoutAddress + '\'');

			dataservRecords = userData.dataservRecords;
			$(document).trigger('setGridRecords', dataservRecords);
			console.log('dataservRecords initialized to \'' + dataservRecords + '\'');
		}
	} catch (err) {
		//if error, then there was no settings file (first run).
		console.log(err.message);
	}
	
	// openPreferencesPopup if path to dataserv-client is not set
	if(!dataservClientPath) {
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

	$(document).on('addDirectory', addDirectory);
	$(document).on('savePrefrences', savePreferences);
	$(document).on('openPreferencesPopup', openPreferencesPopup);
	ipc.on('openPreferencesPopup', openPreferencesPopup);
};