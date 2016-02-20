var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync');
var wrap = require('gulp-wrap');
var rename = require('gulp-rename');
var del = require('del');

gulp.task('default', ['build']);

gulp.task('build', ['build:assets', 'build:blog', 'build:sass']);
gulp.task('build:assets', buildAssetsTask);
gulp.task('build:sass', buildSassTask);
gulp.task('build:blog', buildBlogTask);

gulp.task('watch', ['build'], watchTask);
gulp.task('clean', cleanTask);

function buildAssetsTask() {
  /* takes all files it finds under src/assets/ */
  return gulp.src('src/assets/**')
    /* ... and writes them into the out folder */
    .pipe(gulp.dest('out'))
    /* tell browser-sync which files have changed to inject them */
    .pipe(browserSync.stream());
}

function buildBlogTask() {
  /* takes all json files it finds under src/blog/posts */
  return gulp.src('src/blog/posts/*.json')
    /* wrap uses the data with a template */
    .pipe(wrap({src : 'src/blog/post-template.html'}))
    /* rename the (.json) posts into .html files */
    .pipe(rename({extname : '.html'}))
    /* ... and writes them into the out folder */
    .pipe(gulp.dest('out/blog'))
    /* tell browser-sync which files have changed to inject them */
    .pipe(browserSync.stream());
}

function buildSassTask() {
  /* takes the main.scss file */
  return gulp.src('src/styles/main.scss')
    /* handle errors on the following streams */
    .pipe(plumber(function (err) {
      console.log('[error]', err);
      this.push(null);
    }))
    /* transforms it through sass */
    .pipe(sass({outputStyle : 'expanded'}))
    /* add prefixes for better browser support */
    .pipe(autoprefixer())
    /* ... and writes them into the out folder */
    .pipe(gulp.dest('out/css'))
    /* tell browser-sync which files have changed to inject them */
    .pipe(browserSync.stream());
}

function watchTask() {
  browserSync({
    server : {
      baseDir : 'out'
    },
    open : false
  });

  gulp.watch('src/assets/**', ['build:assets']);
  gulp.watch('src/blog/**', ['build:blog']);
  gulp.watch('src/styles/**', ['build:sass']);
}

function cleanTask() {
  /* del returns a promise, so gulp will know when it's done doing its magic. */
  return del('out');
}
