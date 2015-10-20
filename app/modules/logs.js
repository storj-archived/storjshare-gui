
var ipc = require("electron-safe-ipc/guest");

var output = '';
var maxLength = 1024;

var realizeLogs = function() {
	if(output.length > maxLength) {
		output = output.substr(output.length - maxLength, maxLength);
	}
	$("#modalLogsCode").text(output);
}

exports.init = function() {
	ipc.on('showLogs', exports.showLogs);
	$('#view-output').click(function(e) { e.preventDefault(); exports.showLogs() });
}

exports.addLog = function(record) {
	output += record + "\n";
	realizeLogs();
}

exports.insertLog = function(record) {
	output = record + "\n" + output;
	realizeLogs();
}

exports.clearLogs = function() {
	output = '';
	realizeLogs();
}

exports.showLogs = function() {
	$('#modalLogs').modal('show'); 
}
