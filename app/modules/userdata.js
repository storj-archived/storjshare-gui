/* global $ */
/* global requirejs */

'use strict';

var os = require('os');
var fs = require('fs');
var request = require('request');
var remote = require('remote');
var app = remote.require('app');
var dialog = remote.require('dialog');
var ipc = require("electron-safe-ipc/guest");
var diskspace = require('diskspace');

var rootDrive = os.platform() !== 'win32' ? '/' : 'C';

/*exports.dataservClient = '';
exports.payoutAddress = '';
exports.dataservDirectory = '';
exports.dataservSize = '';
exports.dataservSizeUnit = '';*/
var driveSetting = {
	id: 1,
	dataservClient: '',
	payoutAddress: '',
	dataservDirectory: '',
	dataservSize: '',
	dataservSizeUnit: ''
}
exports.tabs = [];

var selectedTab = 1;

exports.init = function() {

	// load data from config file
	try {
		exports.read(true);
	} catch (error) {
		console.log(error.toString());
	}

	// HAX = temporary workaroud while automatic setup isn't working on OSX
	if(os.platform() !== 'win32') {
		exports.dataservClient = 'dataserv-client';
	}
	
	var tabCount = 2;
	$('#btnAddTab').on('click', function(e){
		var currentTab = tabCount++;
		var newTabPageId = 'tabPage'+ currentTab;
		var newTabId = 'tab' + currentTab;
		var newTab = '<li role="presentation"><a id="' + newTabId + '" href="#' + newTabPageId + '" aria-controls="tab'+ currentTab +'" role="tab" data-toggle="tab" data-tabid="' + currentTab + '">Drive #'+ currentTab +'</a></li>';
		var newTabPage = '<div class="tab-pane fade in active" id="' + newTabPageId + '" role="tabpanel"> \
    <section class="main">\
        <div class="row">\
            <div class="form-group col-xs-12">\
                <label class="control-label" for="address">Payout\
                Address</label>\
                <div class="pull-right">\
                    <span id="amount"><a class="js-external-link" href=\
                    "https://counterwallet.io/">Create New Address</a></span>\
                </div><input class="form-control address input-address" data-error=\
                "Payout address is required" id="address" name="address"\
                placeholder="Enter your SJCX Address" required="" type="text">\
            </div>\
        </div>\
        <div class="row">\
            <div class="form-group col-xs-12">\
                <label class="control-label" for="location">Storage\
                Location</label>\
                <div class="pull-right">\
                    <span id="drive-space"></span>\
                </div>\
                <div class="row">\
                    <div class="col-xs-8">\
                        <input class="form-control directory" name=\
                        "location" placeholder="Select where to keep the data"\
                        type="text">\
                    </div>\
                    <div class="col-xs-4">\
                        <button class="btn btn-blue btn-block browse" id="browse"\
                        type="button">Browse</button>\
                    </div>\
                </div>\
            </div>\
        </div>\
        <div class="row">\
            <div class="form-group col-xs-12">\
                <label class="control-label" for="storage">Storage Size</label>\
                <div class="row">\
                    <div class="col-xs-8">\
                        <input class="form-control size" min="0" name=\
                        "storage" placeholder="Set amount of space to share"\
                        type="number">\
                    </div>\
                    <div class="col-xs-4">\
                        <select class="form-control size-unit">\
                            <option>\
                                MB\
                            </option>\
                            <option selected>\
                                GB\
                            </option>\
                            <option>\
                                TB\
                            </option>\
                        </select>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </section>\
    <section class="action">\
        <div class="row">\
            <div class="col-xs-12">\
                <button class="btn btn-block ladda-button" data-style=\
                "expand-left" id="start"><span id=\
                "start-label">START</span></button>\
            </div>\
        </div>\
    </section>\
</div>';
		$(this).parent().before(newTab);
		$('.tab-content footer').before(newTabPage);
		var newTabSelector = '#' + newTabId;
		$(newTabSelector).tab('show');

		e.preventDefault();
	});


}

exports.read = function(bQuerySJCX) {
	// load data from config file
	 try {
		//test to see if settings exist
		var path = app.getPath('userData') + '/' + window.env.configFileName;
		console.log('Reading settings from \'' + path + '\'');
		fs.openSync(path, 'r+'); //throws error if file doesn't exist
		var data = fs.readFileSync(path); //file exists, get the contents
		var userData = JSON.parse(data); //turn to js object
		for(var s in userData) {
			exports[s] = userData[s];
		}
		if(exports.hasValidPayoutAddress()) {
			$("#address").val(exports.payoutAddress);
		}
		if(exports.hasValidDataservDirectory()) {
			$("#directory").val(exports.dataservDirectory);
		}
		if(exports.hasValidDataservSize()) {
			$("#size").val(exports.dataservSize);
		}
		if(exports.hasValidDataservSize()) {
			$("#size").val(exports.dataservSize);
			$('#size-unit').val(exports.dataservSizeUnit);
		} else {
			exports.dataservSizeUnit = 'GB';
		}
		exports.validate(true);
	} catch (error) { 
		console.log(error.toString());
	}

	$('.nav-tabs')
	.off('shown.bs.tab', 'a[data-toggle="tab"]')
	.on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
		selectedTab = parseInt($(this).data('tabid')) - 1;
	});

	$('.tab-content').on('click', '.browse', function (e) {
		dialog.showOpenDialog({ 
			title: 'Please select directory',
			defaultPath: app.getPath('userDesktop'),
			properties: [ 'openDirectory' ]
			}, function(path) {
				if(path !== undefined && path !== "") {
					$('.directory').val(path);
					
					if (!exports.tabs[selectedTab]) {
						exports.tabs[selectedTab] = {};
					}
					exports.tabs[selectedTab].dataservDirectory = path;
					exports.save();
				}
			}
		);
	});

	// Save settings when user changes the values
	$(".tab-content").on('change', '.address', function() {
		if (!exports.tabs[selectedTab]) {
			exports.tabs[selectedTab] = {};
		}
		exports.tabs[selectedTab].payoutAddress = $(".address").val();
		exports.save(true);
	});
	$(".tab-content").on('change', '.directory', function() {
		//exports.dataservDirectory = $("#directory").val();
		if (!exports.tabs[selectedTab]) {
			exports.tabs[selectedTab] = {};
		}
		exports.tabs[selectedTab].dataservDirectory = $(".directory").val();
		exports.save();
	});
	$(".tab-content").on('change', '.size', function() {
		if (!exports.tabs[selectedTab]) {
			exports.tabs[selectedTab] = {};
		}
		exports.tabs[selectedTab].dataservSize = $(".size").val();
		exports.save();
	});
	$(".tab-content").on('change', '.size-unit', function() {
		if (!exports.tabs[selectedTab]) {
			exports.tabs[selectedTab] = {};
		}
		exports.tabs[selectedTab].dataservSizeUnit = $(".size-unit").val();
		exports.save();
	});
}

exports.save = function(bQuerySJCX) {
	try {
		var path = app.getPath('userData') + '/' + window.env.configFileName;
// IF SIZE UNIT NOT SET SET TO GB

		console.log(JSON.stringify(exports.tabs));
		/*fs.writeFileSync(path, JSON.stringify({
			dataservClient: exports.dataservClient,
			payoutAddress: exports.payoutAddress,
			dataservDirectory: exports.dataservDirectory,
			dataservSize: exports.dataservSize,
			dataservSizeUnit: exports.dataservSizeUnit
		}) , 'utf-8');
		console.log('Saved settings to \'' + path + '\'');
		requirejs('./modules/process').saveConfig();*/
	} catch (error) {
		console.log(error.toString());
	}
	//exports.validate(bQuerySJCX);
};

exports.validate = function(bQuerySJCX) {
	if(bQuerySJCX) {
		exports.querySJCX();
	}
	if(exports.hasValidDataservDirectory() && exports.hasValidDataservSize()) {
		if(os.platform() === 'win32') {
			rootDrive = exports.dataservDirectory.toString().charAt(0);
		}
		exports.queryFreeSpace();
	}
	$('#start').prop('disabled', !exports.hasValidSettings());
}

exports.hasValidDataservClient = function() {
	return exports.dataservClient !== undefined && exports.dataservClient !== '';
}

exports.hasValidPayoutAddress = function() {
	return exports.payoutAddress !== undefined && exports.payoutAddress !== '';
}

exports.hasValidDataservDirectory = function() {
	return exports.dataservDirectory !== undefined && exports.dataservDirectory !== '';
}

exports.hasValidDataservSize = function() {
	return exports.dataservSize !== undefined && exports.dataservSize !== '';
}

exports.hasValidSettings = function() {
	return (exports.hasValidDataservClient() &&
			exports.hasValidPayoutAddress());
}

exports.querySJCX = function(onComplete) {
	if(exports.hasValidPayoutAddress()) {
		request("http://xcp.blockscan.com/api2?module=address&action=balance&btc_address=" + exports.payoutAddress + "&asset=SJCX",
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var createNewAddressHTML = '<a href="https://counterwallet.io/" class="js-external-link">Create New Address</a>';
				if(!body || body === "") {
					$('#amount').html(createNewAddressHTML);
					return;
				}
				var json = JSON.parse(body);
				if(json.status !== "error") {
					$('#amount').html('<p>Balance: ' + json.data[0].balance + ' SJCX</p>');
				} else if(json.message.search("no available SJCX balance") !== -1) {
					$('#amount').html('<p>Balance: 0 SJCX</p>');
				} else {
					$('#amount').html(createNewAddressHTML);
				}
			} else {
				$('#amount').html(createNewAddressHTML);
				console.log(error.toString());
			}
		});
	}
}

exports.queryFreeSpace = function() {
	diskspace.check(rootDrive, function (total, free, status) {
		if(isNaN(free)) {
			$("#drive-space").text("Invalid Directory");
		} else {
			var result = "";
				switch($("#size-unit").val()) {
				case "MB": result = "Free Space: " + (free * 1e-6).toFixed(0) + " MB"; break;
				case "GB": result = "Free Space: " + (free * 1e-9).toFixed(1) + " GB"; break;
				case "TB": result = "Free Space: " + (free * 1e-12).toFixed(2) + " TB"; break;
			}
			$("#drive-space").text(result);
		}
	});
}