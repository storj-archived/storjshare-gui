/* global $ */
/* global __dirname */

'use strict';

var dataservClient;
var payoutAddress;
var dataservDirectory;
var dataservSize;

var getHeader = function() {
	if( dataservClient !== undefined && dataservClient !== '' && payoutAddress !== undefined && payoutAddress !== '' &&
		dataservDirectory !== undefined && dataservDirectory !== '' && dataservSize !== undefined && dataservSize !== '' ) {
		return "Serving <b>" + dataservSize + "</b> at <b>" + dataservDirectory + "</b><br>Payout Address: <b>" + payoutAddress + "</b>";
	}
	//return "dataservClient=" + dataservClient + ", payoutAddress="+ payoutAddress+ ", dataservDirectory="+dataservDirectory+ ", dataservSize="+dataservSize;
	return "Missing data, please check your preferences";
};

var refreshHeader = function() {
	if(w2ui.grid) {
		w2ui.grid.header = getHeader();
		w2ui.grid.refresh();
	}
};

exports.initGrid = function() {
	
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
		header: getHeader(),
		columns: [
			{ field: 'data', size: '100%' },
		],
		onDblClick: function (event) {
			w2alert(w2ui.grid.get(event.recid).data, "Details");
		}
	});

	$(document).on('addGridRecord', function(event, record) {
		if(record) {
			w2ui.grid.add({recid: w2ui.grid.records.length, data: record});
		}
	});

	$(document).on('clearGridRecords', function(event) {
		w2ui.grid.clear();
	});

	$(document).on('setGridRecords', function(event, records) {
		if(records) {
			w2ui.grid.clear();
			w2ui.grid.records = records;
			w2ui.grid.total = records.length;
			w2ui.grid.refresh();
		}
	});

	$(document).on('setDataservClient', function(event, client) { dataservClient = client; refreshHeader(); });
	$(document).on('setPayoutAddress', function(event, address) { payoutAddress = address; refreshHeader(); });
	$(document).on('setDataservDirectory', function(event, directory) { dataservDirectory = directory; refreshHeader(); });
	$(document).on('setDataservSize', function(event, size) { dataservSize = size; refreshHeader(); });
};