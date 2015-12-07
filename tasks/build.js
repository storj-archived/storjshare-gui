'use strict';

var gulp = require('gulp');
var jetpack = require('fs-jetpack');
var utils = require('./utils');
var projectDir = jetpack;
var srcDir = projectDir.cwd('./app');
var destDir = projectDir.cwd('./build');

var paths = {
  copyFromAppDir: [
    './**'
  ],
}
gulp.task('clean', function(callback) {
    return destDir.dirAsync('.', { empty: true });
});

function copyTask() {
  return projectDir.copyAsync('app', destDir.path(), {
    overwrite: true,
    matching: paths.copyFromAppDir
  });
}

gulp.task('copy', ['clean'], copyTask);
gulp.task('copy-watch', copyTask);


gulp.task('finalize', ['clean'], function () {
  var manifest = srcDir.read('package.json', 'json');

  switch (utils.getEnvName()) {
    case 'development':
      // Add "dev" suffix to name, so Electron will write all
      // data like cookies and localStorage into separate place.
      manifest.name += '-dev';
      manifest.productName += '_dev';
      break;
    case 'test':
      // Add "test" suffix to name, so Electron will write all
      // data like cookies and localStorage into separate place.
      manifest.name += '-test';
      manifest.productName += '_test';
      // Change the main entry to spec runner.
      manifest.main = 'spec.js';
      break;
  }

  destDir.write('package.json', manifest);

  var configFilePath = projectDir.path('config/env_' + utils.getEnvName() + '.json');
  destDir.copy(configFilePath, 'env_config.json');
});


gulp.task('watch', function () {
  gulp.watch(paths.copyFromAppDir, { cwd: 'app' }, ['copy-watch']);
});

gulp.task('build', ['copy', 'finalize']);
