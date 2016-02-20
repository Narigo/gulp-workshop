var gulp = require('gulp');
var sass = require('gulp-sass');
var del = require('del');

gulp.task('default', ['build']);

gulp.task('build', ['build:assets', 'build:sass']);
gulp.task('build:assets', buildAssetsTask);
gulp.task('build:sass', buildSassTask);

gulp.task('watch', ['build'], watchTask);
gulp.task('clean', cleanTask);

function buildAssetsTask() {
  /* takes all files it finds under src/assets/ */
  return gulp.src('src/assets/**')
    /* ... and writes them into the out folder */
    .pipe(gulp.dest('out'));
}

function buildSassTask() {
  /* takes the main.scss file */
  return gulp.src('src/styles/main.scss')
    /* transforms it through sass */
    .pipe(sass({outputStyle: 'expanded'}).on('error', function(err) {
      console.log('[error]', err);
      this.push(null);
    }))
    /* ... and writes them into the out folder */
    .pipe(gulp.dest('out/css'));
}

function watchTask() {
  gulp.watch('src/assets/**', ['build:assets']);
  gulp.watch('src/styles/**', ['build:sass']);
}

function cleanTask() {
  /* del returns a promise, so gulp will know when it's done doing its magic. */
  return del('out');
}
