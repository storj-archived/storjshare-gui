/* global $ */

'use strict';

exports.initialize = function() {
	
	var btnCount = 0;
	$('#toolbar').w2toolbar({
		name: 'toolbar',
		items: [
			{ type: 'button',  id: 'poll',  caption: 'Poll', icon: 'w2ui-icon-reload' },
			{ type: 'break',  id: 'break' },
			{ type: 'button', id: 'settings', caption: 'Payment Address', icon: 'fa fa-wrench' },
			{ type: 'break',  id: 'break1' },
			{ type: 'button', id: 'add', caption: 'Add Directory', icon: 'w2ui-icon-plus' },
			{ type: 'button', id: 'remove', caption: 'Remove Directory', icon: 'w2ui-icon-cross' },
		],
		onClick: function (event) {
			switch (event.target) {
				case 'add':
					this.add({ type: 'button', id: 'button' + btnCount, caption: 'button '+ btnCount, img: 'icon-page' });
					btnCount++;
					break;
				case 'remove':
					if (btnCount <= 0) return;
					btnCount--;
					this.remove('button'+ btnCount);
					break;
				case 'settings':
					// TODO
					console.log("TODO: Implement settings");
					break;
				case 'poll':
					console.log("TODO: Implement poll");
					// TODO
					break;
			}
		}
	});
};