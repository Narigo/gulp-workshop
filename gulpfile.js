var gulp = require('gulp');
var del = require('del');

gulp.task('default', ['build']);

gulp.task('build', buildTask);
gulp.task('clean', cleanTask);

function buildTask() {
  /* takes all files it finds under src/assets/ */
  return gulp.src('src/assets/**')
    /* ... and writes them into the out folder */
    .pipe(gulp.dest('out'));
}

function cleanTask() {
  /* del returns a promise, so gulp will know when it's done doing its magic. */
  return del('out');
}
