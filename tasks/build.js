'use strict';

var gulp = require('gulp');
var jetpack = require('fs-jetpack');
var projectDir = jetpack;
var destDir = projectDir.cwd('./build');

var paths = {
  copyFromAppDir: [
    './**'
  ],
};

gulp.task('clean', function() {
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

gulp.task('watch', function () {
  gulp.watch(paths.copyFromAppDir, { cwd: 'app' }, ['copy-watch']);
});

gulp.task('build', ['copy']);
