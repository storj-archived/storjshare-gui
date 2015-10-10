var ipc = require("electron-safe-ipc/guest");

(function () {
	'use strict';
	
    // allow "view logs" to trigger from an href link with class="js-view-logs"
	var supportExternalLinks = function (e) {
		var href;
		var isExternal = false;

		var checkDomElement = function (element) {
			if (element.classList.contains('js-view-logs')) {
				isExternal = true;
			}
			if (isExternal) {
				ipc.send('showLogs');
				e.preventDefault();
			} else if (element.parentElement) {
				checkDomElement(element.parentElement);
			}
		}

		checkDomElement(e.target);
	}

	document.addEventListener('click', supportExternalLinks, false);
}());