/* global $ */
/* global __dirname */

'use strict';

exports.initGrid = function() {
	
	$('#grid').w2grid({ 
		name   : 'grid', 
		show: {
			footer			: true,
			toolbar         : false,
			toolbarReload   : false,
			toolbarColumns  : false,
			toolbarSearch   : false,
			toolbarAdd      : false,
			toolbarDelete   : false,
			toolbarSave     : false,
		},
		columns: [                
			{ field: 'path', caption: 'Directory Path', size: '70%' },
			{ field: 'size', caption: 'Allocated Size', size: '15%' },
			{ field: 'status', caption: 'Status', size: '15%' },
		],
	});

	$(document).on('setGridRecords', function(event, records) {
		if(records) {
			w2ui.grid.clear();
			w2ui.grid.records = records;
			w2ui.grid.total = records.length;
			w2ui.grid.refresh();
		}
	});
};