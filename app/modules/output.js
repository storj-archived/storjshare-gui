/* global $ */
/* global w2ui */
/* global w2alert */
/* global requirejs */

'use strict';

var data ='';
var ipc = require("electron-safe-ipc/guest");

exports.init = function() {
	ipc.on('openLogsPopup', exports.showLogs);
};

exports.showLogs = function() {
	require('dialog').showMessageBox({
		title: 'Logs',
		message: data
		}
	);
};

exports.clear = function() {
	data = '';
};

exports.add = function(record) {
	data += record + "\n";
};

exports.insert = function(record) {
	data = record + "\n" + data;
};
