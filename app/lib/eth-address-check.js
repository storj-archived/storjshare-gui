'use strict';

module.exports = function(teststring){
	if(typeof teststring !== 'string') {
		return false;
	}
	if(teststring.length !== 42) {
		return false;
	}
	if(teststring.substring(0,2) !== '0x') {
		return false;
	}
	//Check to make sure the string is valid hex
	let hex = '0123456789abcdef';
	let lowercase = teststring.toLowerCase().substring(2,42);
	for(let i = 0; i < lowercase.length; i++) {
		if(hex.indexOf(lowercase.substring(i,i+1)) < 0) {
			return false;
		}
	}
	//All clear
	return true;
};