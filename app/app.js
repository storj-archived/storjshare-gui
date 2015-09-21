// -----------------------------------------------------
// Here is the starting point for your own code.
// All stuff below is just to show you how it works.
// -----------------------------------------------------
'use strict';

// Node modBules are required the same way as always.
//var os = require('os');

// window.env contains data from config/env_XXX.json file.
document.getElementById('env-name').innerHTML = window.env.name;
document.getElementById('version').innerHTML = window.env.version;

