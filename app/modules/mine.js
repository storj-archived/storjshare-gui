var os = require('os');
var exec = require('child_process').execFile;
var spawn = require('child_process').spawn;
var child_process = require('child_process');



function mine() {
	var exePath = 'c:\\ethminer\\steamminer.exe';
	var addr = document.getElementById('emailField').value;
	var typeofcard = document.getElementById('gcard').value;

/*	if (typeofcard == "Yes") {

		typeofcard = '-G';

	} else {

		typeofcard = '';

	}

	*/

	var args = ['-F','mine.weipool.org:5555/'+ addr + '/18' + typeofcard];

	var child = spawn(exePath,args);

	child.stdout.on('data',function(d){

		console.log(d);

	});

	child.stderr.on('data',function(d){

		console.log(d.toString());

	});

	child.on('close',function(code,signal){

		console.log('closed with code:' + code + ' and signal: ' + signal);


	});

};





function getData() {
    var emailField = document.getElementById('emailField').value;
		var speed = document.getElementById('speedField').value;


    if (emailField.length < 3) {
        email.textContent = 'Email must contain at least 3 characters';
        //alert('Username must contain at least 3 characters');
    } else {
        email.textContent = 'Your Email is: ' + emailField;
				speed = "Processing Speed: " + speed;

    }

};


// use an eventlistener for the event
var startButton = document.getElementById('startButton');
startButton.addEventListener('click', getData, false);
startButton.addEventListener('click', mine);
