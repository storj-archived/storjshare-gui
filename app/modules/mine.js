var os = require('os');
var exec = require('child_process').execFile;
var spawn = require('child_process').spawn;
var child_process = require('child_process');



function mine() {
	var exePath = 'c:\\ethminer\\steamminer.exe';
	var addr = document.getElementById('emailField').value;
	var typeofcard = document.getElementById('gcard').value;


	if (typeofcard == "Yes") {

		typeofcard = '-G';
		var args = ['-F','mine.weipool.org:5555/'+ addr + '/18', typeofcard ];

	} else {

		var args = ['-F','mine.weipool.org:5555/'+ addr + '/18' ];


	}
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
var email = document.getElementById('emailField').value;
var speed = document.getElementById('speedField').value;
var card = document.getElementById('gcard').value;

document.getElementById("emailtext").innerHTML = 'Your Email is: ' + email.bold() + '<br />';
document.getElementById("speedtext").innerHTML = "Processing Speed: " + speed.bold() + '<br />';

if (card == "Yes") {

	document.getElementById("card").innerHTML = "Graphics Card: " + speed.bold() + '<br /> Close the program to stop earning money.';

} else {


	document.getElementById("card").innerHTML = "Graphics Card: " + speed.bold() + '<br /> Warning '.fontcolor("red").bold() + "this will make your PC unusable." + '<br /> Close the program to stop earning money.';

}



};


function showFilterItem() {
	var startButtontext = document.getElementById('startButton').innerHTML;

    if (startButtontext == "START") {
				startButton.style.backgroundColor = '#FFA500';
				startButton.style.border = '#FFA500';
				document.getElementById("startButton").innerHTML = "RUNNING, CLICK TO ABORT";

    } else {

				startButton.style.backgroundColor = '#88C425';
				startButton.style.border = '#88C425';
				document.getElementById("startButton").innerHTML = "START";

    }
};

// use an eventlistener for the event
var startButton = document.getElementById('startButton');

startButton.addEventListener('click', getData, false);
startButton.addEventListener('click', mine);
startButton.addEventListener('click', showFilterItem);
