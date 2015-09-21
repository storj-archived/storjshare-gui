/* global $ */
/* global __dirname */

'use strict';

exports.initialize = function() {
	
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
		//height : '100%',
		columns: [                
			{ field: 'fpath', caption: 'Directory Path', size: '70%' },
			{ field: 'fsize', caption: 'Allocated Size', size: '15%' },
			{ field: 'fstatus', caption: 'Status', size: '15%' },
		],
		records: [
			{ recid: 1, fpath: __dirname, fsize: '##MB', fstatus: 'Ready'}
		]
	});
	
};