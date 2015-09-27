/* global $ */
/* global w2ui */
/* global w2alert */
/* global requirejs */

'use strict';

var app;
var userData;
var maxRecords = 100;

var ipc = require("electron-safe-ipc/guest");

exports.initLogs = function() {
	ipc.on('openLogsPopup', exports.openLogsPopup);

	// widget configuration
	var config = {
		layout: {
			name: 'logsLayout',
			padding: 0,
			panels: [
				{ type: 'main', minSize: 350, overflow: 'hidden' }
			]
		},
		grid: { 
			name: 'grid',
			style: 'border: 0px; border-left: 1px solid silver',
			show: {
				header          : false,
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
		}
	}

	$().w2layout(config.layout);
    $().w2grid(config.grid);
};

exports.openLogsPopup = function() {
	w2popup.open({
		title   : 'Logs',
		width   : 900,
		height  : 600,
		showMax : false,
		body    : '<div id="main" style="position: absolute; left: 5px; top: 5px; right: 5px; bottom: 5px;"></div>',
		onOpen  : function (event) {
			event.onComplete = function () {
				$('#w2ui-popup #main').w2render('logsLayout');
				w2ui.logsLayout.content('main', w2ui.grid);
			};
		},
		onToggle: function (event) { 
			event.onComplete = function () {
				w2ui.logsLayout.resize();
			}
		}
	});
};

exports.clear = function() {
	w2ui.grid.clear();
};

exports.add = function(record) {
	if(w2ui.grid && record) {
		w2ui.grid.add({recid: w2ui.grid.records.length + 1, data: record});
		while(w2ui.grid.records.length > maxRecords) {
			w2ui.grid.records.shift();
		}
		w2ui.grid.refresh();
	}
};

exports.insert = function(record) {
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
