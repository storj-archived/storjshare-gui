
var ipc = require("electron-safe-ipc/guest");

var output = '';
var maxLength = 1048576 / 16; // approximately 1 MB of string memory 

var realizeLogs = function() {
	if(output.length > maxLength) {
		var staringIndex = output.indexOf('\n') + 1;
		output = output.substr(staringIndex, output.length);
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
