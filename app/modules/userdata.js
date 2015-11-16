/* global $ */
/* global Ladda */
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
var process;

var rootDrive = os.platform() !== 'win32' ? '/' : 'C';

exports.tabs = [];
var selectedTab = 0;
var tabCount = 0;
var laddaButtons = [];

exports.init = function() {

	// load data from config file
	try {
		read(true);
	} catch (error) {
		console.log(error.toString());
	}

	// HAX = temporary workaroud while automatic setup isn't working on OSX
	if(os.platform() !== 'win32') {
		exports.dataservClient = 'dataserv-client';
	}

	process = requirejs('./modules/process');
	
	$('#btnAddTab').on('click', function(e){
		var currentTab = ++tabCount;
		createTab(currentTab);
		showTab(currentTab);
		e.preventDefault();
	});
};

exports.save = function(bQuerySJCX) {
	try {
		var path = app.getPath('userData') + '/' + window.env.configFileName;
		var index = selectedTab - 1;
		var tabData = exports.tabs[index];

		ensureDataServClient(tabData, function(err){
			if (err) {
				console.log(err);
			} else {
				console.log(JSON.stringify(exports.tabs));
				fs.writeFileSync(path, JSON.stringify({
									tabs: exports.tabs,
									dataservClient: exports.dataservClient
								}) , 'utf-8');

				console.log('Saved settings to \'' + path + '\'');
				
				process.saveConfig(tabData.dataservClient, tabData.payoutAddress);
				validate(bQuerySJCX, tabData);
			}
		});	
	} catch (error) {
		console.log(error.toString());
	}
	
	/*for (var i = 0; i < exports.tabs.length; i++) {
		var tabData = exports.tabs[i];
		validate(bQuerySJCX, tabData);
	}*/
};

var read = function(bQuerySJCX) {
	// load data from config file
	 try {
		//test to see if settings exist
		var path = app.getPath('userData') + '/' + window.env.configFileName;
		console.log('Reading settings from \'' + path + '\'');
		try{
			fs.openSync(path, 'r+'); //throws error if file doesn't exist
		} catch(ex) {
			fs.writeFileSync(path, '{}');
		}
		var data = fs.readFileSync(path); //file exists, get the contents

		var userData = JSON.parse(data); //turn to js object
		
		// If there is dataserv client installed set it
		if (userData.dataservClient) {
			exports.dataservClient = userData.dataservClient;
		}

		// If there isn't any saved user data or first run create the first tab only
		if (!userData || !userData.tabs || userData.tabs.length <= 0) {
			var currentTab = ++tabCount;
			createTab(currentTab);
			showTab(currentTab);
		}
		else {
			tabCount = userData.tabs.length;			
			exports.tabs = userData.tabs;

			for (var i = 0; i < tabCount; i++) {
				var tabData = userData.tabs[i];
				
				if (!tabData) continue;

				var currentTab = i + 1;
				createTab(currentTab);
				showTab(currentTab);

				if(hasValidPayoutAddress(tabData.payoutAddress)) {
					setValue(currentTab, '.address', tabData.payoutAddress);
				}
				if(hasValidDataservDirectory(tabData.dataservDirectory)) {
					setValue(currentTab, '.directory', tabData.dataservDirectory);
				}
				if(hasValidDataservSize(tabData.dataservSize)) {
					setValue(currentTab, '.size', tabData.dataservSize);
					setValue(currentTab, '.size-unit', tabData.dataservSizeUnit);
				} else {
					tabData.dataservSizeUnit = 'GB';
				}

				validate(bQuerySJCX, tabData);
			}
			showTab(1);
		}
		
	} catch (error) { 
		console.log(error.toString());
	}

	$('.nav-tabs')
	.off('shown.bs.tab', 'a[data-toggle="tab"]')
	.on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
		selectedTab = parseInt($(this).data('tabid'));
	});

	$('.tab-content').on('click', '.browse', function (e) {
		dialog.showOpenDialog({ 
			title: 'Please select directory',
			defaultPath: app.getPath('userDesktop'),
			properties: [ 'openDirectory' ]
			}, function(path) {
				if(path !== undefined && path !== "") {
					var currentTabId = '#tabPage' + (selectedTab);
					$(currentTabId + ' .directory').val(path[0]);
					
					ensureTab(selectedTab);
					exports.tabs[selectedTab - 1].dataservDirectory = path[0];
					exports.save();
				}
			}
		);
	});

	// Save settings when user changes the values
	$(".tab-content").on('change', '.address', function() {
		ensureTab(selectedTab);
		exports.tabs[selectedTab - 1].payoutAddress = getValue(selectedTab, '.address');
		exports.save(true);
	});
	$(".tab-content").on('change', '.directory', function() {
		ensureTab(selectedTab);
		exports.tabs[selectedTab - 1].dataservDirectory = getValue(selectedTab, '.directory');
		exports.save();
	});
	$(".tab-content").on('change', '.size', function() {
		ensureTab(selectedTab);
		exports.tabs[selectedTab - 1].dataservSize = getValue(selectedTab, '.size');
		exports.save();
	});
	$(".tab-content").on('change', '.size-unit', function() {
		ensureTab(selectedTab);
		exports.tabs[selectedTab - 1].dataservSizeUnit = getValue(selectedTab, '.size-unit');
		exports.save();
	});

	$('.tab-content').on('click', '.remove-tab', function(){
		var confirmRemove = confirm('Are you sure to remove this drive?');
		if (confirmRemove) {
			removeTab(selectedTab);
		}
	});

	$(".tab-content").on('click', '.start', function (e) {
		var tabData = exports.tabs[selectedTab - 1];			
		if(hasValidSettings(tabData)) {
			if(process.currentProcess && process.currentProcess[tabData.dataservClient]) {
				process.terminateProcess(tabData.dataservClient);
			} else {
				process.farm(tabData.dataservClient, tabData.dataservDirectory, tabData.dataservSize, tabData.dataservSizeUnit);
			}
		}
		realizeUI();
	});
};

var validate = function(bQuerySJCX, tabData) {
	if(bQuerySJCX) {
		querySJCX(tabData);
	}
	if(hasValidDataservDirectory() && hasValidDataservSize()) {
		if(os.platform() === 'win32') {
			rootDrive = dataservDirectory.toString().charAt(0);
		}
		queryFreeSpace(tabData);
	}

	var finalSelector = getFinalSelector('.start');	

	$(finalSelector).prop('disabled', !hasValidSettings(tabData));
};

exports.hasValidDataservClient = function() {
	return exports.dataservClient !== undefined && exports.dataservClient !== '';
};

var hasValidPayoutAddress = function(payoutAddress) {
	return payoutAddress !== undefined && payoutAddress !== '';
};

var hasValidDataservDirectory = function(dataservDirectory) {
	return dataservDirectory !== undefined && dataservDirectory !== '';
};

var hasValidDataservSize = function(dataservSize) {
	return dataservSize !== undefined && dataservSize !== '';
};

var hasValidSettings = function(tabData) {
	return (exports.hasValidDataservClient() &&
			hasValidPayoutAddress(tabData.payoutAddress));
};

var querySJCX = function(onComplete, tabData) {
	if(hasValidPayoutAddress()) {
		request("http://xcp.blockscan.com/api2?module=address&action=balance&btc_address=" + tabData.payoutAddress + "&asset=SJCX",
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var createNewAddressHTML = '<a href="https://counterwallet.io/" class="js-external-link">Create New Address</a>';
				var finalSelector = getFinalSelector('.amount');
				var amountEl = $(finalSelector);
				if(!body || body === "") {
					amountEl.html(createNewAddressHTML);
					return;
				}
				var json = JSON.parse(body);
				if(json.status !== "error") {
					amountEl.html('<p>Balance: ' + json.data[0].balance + ' SJCX</p>');
				} else if(json.message.search("no available SJCX balance") !== -1) {
					amountEl.html('<p>Balance: 0 SJCX</p>');
				} else {
					amountEl.html(createNewAddressHTML);
				}
			} else {
				amountEl.html(createNewAddressHTML);
				console.log(error.toString());
			}
		});
	}
};

var queryFreeSpace = function(tabData) {
	diskspace.check(rootDrive, function (total, free, status) {
		if(isNaN(free)) {
			$("#drive-space").text("Invalid Directory");
		} else {
			var result = "";
				switch(tabData.dataservSizeUnit) {
				case "MB": result = "Free Space: " + (free * 1e-6).toFixed(0) + " MB"; break;
				case "GB": result = "Free Space: " + (free * 1e-9).toFixed(1) + " GB"; break;
				case "TB": result = "Free Space: " + (free * 1e-12).toFixed(2) + " TB"; break;
			}
			$("#drive-space").text(result);
		}
	});
};

var realizeUI = function() {
	var tabData = exports.tabs[selectedTab - 1];	
	var isDisabled = process.currentProcess[tabData.dataservClient] !== null;

	$(getFinalSelector('.main')).toggleClass('disabled', isDisabled );
	$(getFinalSelector('.address')).prop('disabled', isDisabled);
	$(getFinalSelector('.directory')).prop('disabled', isDisabled);
	$(getFinalSelector('.browse')).prop('disabled', isDisabled);
	$(getFinalSelector('.size')).prop('disabled', isDisabled);
	$(getFinalSelector('.size-unit')).prop('disabled', isDisabled);

	if(isDisabled) {
		laddaButtons[selectedTab].start();
		$(getFinalSelector('.start')).prop('disabled', false); // l.start causes the bootstrap button to be unclickable, this ensures we can still click the button
		$(getFinalSelector('.start')).css({ 'background-color': '#FFA500', 'border-color': '#FFA500' }); // orange
		$(getFinalSelector('.start-label')).text('RUNNING, CLICK TO ABORT');
	} else {
		laddaButtons[selectedTab].stop();
		$(getFinalSelector('.start')).css({ 'background-color': '#88C425', 'border-color': '#88C425' }); // green
		$(getFinalSelector('.start-label')).text('START');
	}
};

var ensureTab = function(index){
	if (!exports.tabs[index - 1]) {
		exports.tabs[index - 1] = {dataservSizeUnit: 'GB'};
	}
};

var getValue = function(index, selector){
	var finalSelector = getFinalSelector(selector);	
	return $(finalSelector).val();
};

var setValue = function(index, selector, value){
	var finalSelector = getFinalSelector(selector);	
	return $(finalSelector).val(value);
};

var getFinalSelector = function (selector) {
    var currentTabId = "#tabPage" + selectedTab;
    var finalSelector = currentTabId + " " + selector;
    return finalSelector;
};

var createTab = function(index){
	var newTabPageId = 'tabPage'+ index;
	var newTabId = 'tab' + index;
	var newTab = '<li role="presentation"><a id="' + newTabId + '" href="#' + newTabPageId + '" aria-controls="tab'+ index +'" role="tab" data-toggle="tab" data-tabid="' + index + '">Drive #'+ index +'</a></li>';
	var newTabPage = '<div class="tab-pane fade in active" id="' + newTabPageId + '" role="tabpanel"> \
    <section class="main">\
    	<a href="#" class="pull-right remove-tab"><i class="fa fa-times"></i></a>\
        <div class="row">\
            <div class="form-group col-xs-12">\
                <label class="control-label" for="address">Payout\
                Address</label>\
                <div class="pull-right">\
                    <span class="amount"><a class="js-external-link" href=\
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
                <button class="btn btn-block ladda-button start" disabled="true" data-style=\
                "expand-left"><span class="start-label">START</span></button>\
            </div>\
        </div>\
    </section>\
</div>';
	$("#btnAddTab").parent().before(newTab);
	$('.tab-content').append(newTabPage);
};

var showTab = function(index){
	var newTabId = 'tab' + index;
	var newTabSelector = '#' + newTabId;
	$(newTabSelector).tab('show');
	selectedTab = index;
	ensureTab(selectedTab);
	if (!laddaButtons[index]) {
		laddaButtons[index] = Ladda.create($(getFinalSelector('.start')).get(0));
	}
};

var ensureDataServClient = function (tabData, cb) { 
	if (tabData.dataservClient) {
		return cb(null)
	}
	// Get the directory of the dataserv-client executable
    var dataservClientDirectory = require("path").dirname(exports.dataservClient);
    var dataservClientFilename = require("path").basename(exports.dataservClient); 

    // Create the path of the data serv client for the current tab
    var randomNum = randomNumber();
    var newDataServClientDirectory = dataservClientDirectory + randomNum;
    var newDataServClient = newDataServClientDirectory + "/" + dataservClientFilename; 

    // Check if the dataserv client for the current tab exists
    require("fs").stat(newDataServClient, function(err, stat) { 
    	// If the dataserv client doesn't exist
        if (err && err.code == "ENOENT") { 
        	// Make a copy from the original dataserv-client
            var fs = require("fs-extra");
            fs.copy(dataservClientDirectory, newDataServClientDirectory, function(err) {
                if (err) {
                    console.log(err)
                } else {
                	tabData.dataservClient = newDataServClient;
                }
                cb(err);
            })
        } else {
        	cb(null);
        }
    });
};

var removeTab = function(selectedTab) {
    var tabId = "#tab" + selectedTab;
    var tabPageId = "#tabPage" + selectedTab; // Remove tab handle
    $(tabId).remove(); 

    // Remove tab page (contents)
    $(tabPageId).remove();
    var fs = require("fs-extra"); 

    // Remove the data serv client
    var tabData = exports.tabs[selectedTab - 1];
    var dataservClientDirectory = require("path").dirname(tabData.dataservClient);
    if (dataservClientDirectory) {
        fs.removeSync(dataservClientDirectory)
    } 
    
    // Remove the storeage location
    if (tabData.dataservDirectory) {
        fs.removeSync(tabData.dataservDirectory)
    } 

    // Remove tab from the settings
    exports.tabs.splice(selectedTab - 1, 1); 

    // Save the settings
    exports.save(); 

    // Read from the newly saved settings and rebuild the UI
    read(true);

    console.log(tabId + " and " + tabPageId + " is removed");
};

var randomNumber = function() {
	// Returns random 4-digit integer
    return Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
}
