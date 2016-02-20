var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync');
var wrap = require('gulp-wrap');
var rename = require('gulp-rename');
var through = require('through2');
var merge = require('merge-stream');
var gutil = require('gulp-util');
var marked = require('gulp-marked');
var source = require('vinyl-source-stream');
var path = require('path');
var ghPages = require('gulp-gh-pages');
var del = require('del');

gulp.task('default', ['build']);

gulp.task('build', ['build:assets', 'build:blog', 'build:sass']);
gulp.task('build:assets', buildAssetsTask);
gulp.task('build:sass', buildSassTask);
gulp.task('build:blog', buildBlogTask);

gulp.task('deploy', ['build'], deployTask);

gulp.task('watch', ['build'], watchTask);
gulp.task('clean', cleanTask);

function deployTask() {
  return gulp.src('out/**')
    .pipe(ghPages());
}

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
  var posts = gulp.src('src/blog/posts/*.json')
    .pipe(plumber(function (err) {
      console.log('[error]', err);
      this.push(null);
    }));

  /* split the stream into two paths */
  var processedPosts = posts
    .pipe(through.obj(function (file, _, callback) {
      var self = this;
      /* get the data from the json file contents */
      var data = JSON.parse(file.contents);
      /* look for a .md file */
      var filePath = file.path.replace(/\.json$/, '.md');

      /* use the .md file and process it through marked */
      gulp.src(filePath)
        .pipe(marked())
        .pipe(through.obj(function (mdFile, _, mdCallback) {

          /* replace 'content' field with processed file */
          data.content = mdFile.contents.toString();
          file._contents = new Buffer(JSON.stringify(data));

          mdCallback();

          /* push the modified json data back into first stream */
          self.push(file);
          callback();
        }));
    }))
    /* create a post from the data */
    .pipe(wrap({src : 'src/blog/post-template.html'}))
    /* rename the (.json) posts into .html files */
    .pipe(rename({extname : '.html'}))
    /* ... and writes them into the out folder */
    .pipe(gulp.dest('out/blog'));

  /* split the stream into two paths */
  var indexFile = posts
  /* get infos from post json */
    .pipe(through.obj(function (obj, _, callback) {
      var json = JSON.parse(obj.contents);
      json.url = 'blog/' + path.basename(obj.path, path.extname(obj.path)) + '.html';
      this.push(json);
      callback();
    }))
    /* buffer the stream of objects into a single array */
    .pipe(gutil.buffer())
    /* stringify that array */
    .pipe(through.obj(function (arr, _, callback) {
      // we could sort the array here...
      this.push(JSON.stringify({posts : arr}));
      callback();
    }))
    /* make a vinyl file out of the stringified array */
    .pipe(source('blog.json'))
    /* push the infos as json into an index template */
    .pipe(wrap({src : 'src/blog/index-template.html'}))
    /* use an html extension again */
    .pipe(rename({extname : '.html'}))
    /* write the file when done */
    .pipe(gulp.dest('out/'));

  /* merge the splitted streams again */
  return merge(processedPosts, indexFile)
  /* tell browser-sync which files have changed to inject them */
    .pipe(browserSync.stream())
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
