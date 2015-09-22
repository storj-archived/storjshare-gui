/* global $ */
/* global __dirname */
'use strict';

var app;
var userData;
var maxRecords = 50;

var refreshHeader = function() {
	if(w2ui.grid) {
		if(app.hasValidSettings()) {
			w2ui.grid.header =  "Serving <b>" + userData.dataservSize +
								"</b> at <b>" + userData.dataservDirectory +
								"</b><br>Payout Address: <b>" + userData.payoutAddress + "</b>";
		} else {
			w2ui.grid.header =  "Missing data, please check your preferences";
		}
		w2ui.grid.refresh();
	}
};

exports.initGrid = function() {

	app = requirejs('./app');
	userData = app.userData;
	
	$('#grid').w2grid({ 
		name   : 'grid', 
		show: {
			header          : true,
			columnHeaders   : false,
			footer          : false,
			toolbar         : false,
			toolbarReload   : false,
			toolbarColumns  : false,
			toolbarSearch   : false,
			toolbarAdd      : false,
			toolbarDelete   : false,
			toolbarSave     : false,
		},
		columns: [
			{ field: 'data', size: '100%' },
		],
		onDblClick: function (event) {
			w2alert(w2ui.grid.get(event.recid).data, "Details");
		}
	});

	$(document).on('settingsSaved', function(event, client) { refreshHeader(); });
	refreshHeader();
};

exports.clear = function() {
	w2ui.grid.clear();
};

exports.addRecord = function(record) {
	if(record) {
		w2ui.grid.add(0, 0, {recid: 0, data: record});
	}
};

exports.insertRecord = function(record) {
	if(record) {
		w2ui.grid.records.splice(0, 0, {recid: 0, data: record});

		if(w2ui.grid.records.length > maxRecords)
			w2ui.grid.records.pop();

		for (var i = w2ui.grid.records.length - 1; i >= 0; i--) {
			w2ui.grid.records[i].recid = i;
		}
		w2ui.grid.refresh();
	}
};
