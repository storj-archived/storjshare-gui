/* global $ */
/* global w2ui */
/* global w2alert */
/* global requirejs */

'use strict';

var app;
var userData;
var maxRecords = 50;

exports.initGrid = function() {

	app = requirejs('./app');
	userData = app.userData;
	var process = requirejs('./modules/process');
	var preferences = requirejs('./modules/preferences');
	
	$('#grid').w2grid({ 
		name   : 'grid', 
		show: {
			header          : true,
			columnHeaders   : false,
			footer          : false,
			toolbar         : true,
			toolbarReload   : false,
			toolbarColumns  : false,
			toolbarSearch   : false,
			toolbarAdd      : false,
			toolbarDelete   : false,
			toolbarSave     : false,
		},
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
		},
		columns: [
			{ field: 'data', size: '100%' },
		],
		onDblClick: function (event) {
			w2alert(w2ui.grid.get(event.recid).data, "Details");
		}
	});

	exports.refreshToolbar();
	exports.refreshHeader();
};

exports.refreshHeader = function() {
	if(w2ui.grid) {
		if(app.hasValidSettings()) {
			w2ui.grid.header = "Serving <b>" + userData.dataservSize +
							   "</b> at <b>" + userData.dataservDirectory +
							   "</b><br>Payout Address: <b>" + userData.payoutAddress + "</b>";
		} else {
			w2ui.grid.header = "Missing data, please check your preferences";
		}
		w2ui.grid.refresh();
	}
};

exports.refreshToolbar = function() {
	if(w2ui.grid) {
		if(requirejs('./modules/process').child) {
			w2ui.grid.toolbar.set('action', { caption: 'Stop', icon: 'fa fa-ban' });
		} else {
			w2ui.grid.toolbar.set('action', { caption: 'Start', icon: 'fa fa-cloud-upload' });
		}
		w2ui.grid.toolbar.refresh();
	}
};

exports.clear = function() {
	w2ui.grid.clear();
};

exports.addRecord = function(record) {
	if(w2ui.grid && record) {
		w2ui.grid.add(0, 0, {recid: 0, data: record});
		var needsRefresh = false;
		while(w2ui.grid.records.length > maxRecords) {
			w2ui.grid.records.shift();
			needsRefresh = true;
		}
		if(needsRefresh) {
			w2ui.grid.refresh();
		}
	}
};

exports.insertRecord = function(record) {
	if(w2ui.grid && record) {
		w2ui.grid.records.splice(0, 0, {recid: 0, data: record});

		while(w2ui.grid.records.length > maxRecords) {
			w2ui.grid.records.pop();
		}

		for (var i = w2ui.grid.records.length - 1; i >= 0; i--) {
			w2ui.grid.records[i].recid = i;
		}
		w2ui.grid.refresh();
	}
};
