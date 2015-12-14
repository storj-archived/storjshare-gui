console.log('spawn');

var os = require('os');
var exec = require('child_process').execFile;
var spawn = require('child_process').spawn;
var child_process = require('child_process');

var mining = mine();

function mine() {
	var exePath = 'c:\\ethminer\\ethminer.exe';

	var addr = document.getElementById('emailField').value;
	var args = ['-F','http://ethereumpool.co/?miner=5@'+ addr + '@1','-G'];

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

}





function getData() {
    var emailField = document.getElementById('emailField').value;
		var speedField = document.getElementById('speedField').value;
    var result = document.getElementById('result');
		console.log(emailField)
		console.log(speedField)

    if (emailField.length < 3) {
        email.textContent = 'Email must contain at least 3 characters';
        //alert('Username must contain at least 3 characters');
    } else {
        email.textContent = 'Your Email is: ' + emailField ;
        //alert(nameField);
    }
}

Processing.textContent = 'Processing Speed is: ' + speedField ;

// use an eventlistener for the event
var startButton = document.getElementById('startButton');
startButton.addEventListener('click', getData, false);
