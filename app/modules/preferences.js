
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
var dataservClientPath = "";
var dataservConfigFile = "preferences.json";

exports.initPreferences = function() {
	// load data from config file
	 try {
		//test to see if settings exist
		var path = app.getPath('userData') + '/' + dataservConfigFile;
		console.log('Reading settings from \'' + path + '\'');
		fs.openSync(path, 'r+'); //throws error if file doesn't exist
		var data = fs.readFileSync(path); //file exists, get the contents
		userData = JSON.parse(data); //turn to js object
		payoutAddress = userData.payoutAddress;
		dataservClientPath = userData.dataservClientPath;
		console.log('payoutAddress initialized to \'' + payoutAddress + '\'');
		console.log('dataservClientPath initialized to \'' + dataservClientPath + '\'');
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
			onClose   : function (event) { window.setTimeout(function() { module.exports.openPreferencesPopup(); });  },
			onKeydown : function (event) { window.setTimeout(function() { module.exports.openPreferencesPopup(); });  }
		});
	}

	$(document).on('openPreferencesPopup', module.exports.openPreferencesPopup);
	ipc.on('openPreferencesPopup', function(message) {
		module.exports.openPreferencesPopup();
	});

	// send data to process.js
	$(document).trigger('setDataservClientPath', dataservClientPath );
	$(document).trigger('setPayoutAddress', payoutAddress);
};

module.exports.openPreferencesPopup = function() {
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
				'           <button name="browseDataservClient" class="btn"">Browse</button>'+
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
					payoutAddress = $('#payoutAddress').val();
					$(document).trigger('setPayoutAddress', payoutAddress);
					
					dataservClientPath = $('#dataservClientPath').val();
					$(document).trigger('setDataservClientPath', dataservClientPath );
					
					this.validate();
				},
				"browseDataservClient" : function() {
					$('#dataservClientPath').val(dialog.showOpenDialog({ 
						title: 'Please select dataserv-client executable',
						defaultPath: app.getPath('userDesktop'),
						properties: [ 'openFile' ]
					}));
				}
			},
			onValidate: function(event) {
				if(dataservClientPath !== "" && payoutAddress !== "") {
					savePrefences();
					$().w2popup('close');
					$().w2popup('clear');
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
					console.log("renderedPopup");
					// specifying an onOpen handler instead is equivalent to specifying an onBeforeOpen handler, which would make this code execute too early and hence not deliver.
					$('#w2ui-popup #form').w2render('preferencesPopup');
				}
			}
		});
	}
}

var savePrefences = function() {
	try {
		userData.payoutAddress = payoutAddress;
		userData.dataservClientPath = dataservClientPath;
		var path = app.getPath('userData') + '/' + dataservConfigFile;
		fs.writeFileSync(path, JSON.stringify(userData) , 'utf-8');
		console.log('Saved \'' + userData + '\' to \'' + path + '\'');
	} catch (err) {
		throw err;
	}
};
