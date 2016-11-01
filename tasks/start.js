/* global process */
'use strict';

var Q = require('q');
var electron = require('electron');
var pathUtil = require('path');
var childProcess = require('child_process');
var utils = require('./utils');

var gulpPath = pathUtil.resolve('./node_modules/.bin/gulp');
if (process.platform === 'win32') {
    gulpPath += '.cmd';
}

var runBuild = function () {
    var deferred = Q.defer();

    var build = childProcess.spawn(gulpPath, [
        'build',
        '--env=' + utils.getEnvName(),
        '--color'
    ], {
        stdio: 'inherit'
    });

    build.on('close', function() {
        deferred.resolve();
    });

    return deferred.promise;
};

var runApp = function () {

	var args = [];

	if(utils.getEnvName() === 'development') {
		args.push('--debug=5858');
	}

	args.push('./build');

    var app = childProcess.spawn(electron, args, { stdio: 'inherit' });

    app.on('close', function () {
        process.exit();
    });
};

runBuild()
.then(function () {
    runApp();
});
