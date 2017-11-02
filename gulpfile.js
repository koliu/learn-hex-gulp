var gulp = require('gulp'); // 引入 gulp
var $ = require('gulp-load-plugins')(); // just use for gulp-xxx
var autoprefixer = require('autoprefixer');

// 加入任務
gulp.task('copyHTML', function () {
	// copy src/*.* to dist/
	return gulp.src('./src/**/*.html')
  .pipe($.plumber())
	.pipe(gulp.dest('./dist/'));
});

gulp.task('jade', function() {
  // var YOUR_LOCALS = {};
 
  // gulp.src('./src/*.jade')
  gulp.src('./src/**/*.jade') // for all sub-dirs & files belong to src
    .pipe($.plumber())
    .pipe($.jade({
    	pretty: true // Don't compress
    }))
    .pipe(gulp.dest('./dist/'))
});

gulp.task('scss', function () {
  var plugins = [
    autoprefixer({browsers: [
      'last 1 version',
      '> 5%',
      'ie 6-8',
      'Firefox > 20'
      ]})
  ];

  return gulp.src('./src/scss/*.scss')
    .pipe($.plumber())
    .pipe($.sass().on('error', $.sass.logError)) // compile to css
    .pipe($.postcss(plugins))
    .pipe(gulp.dest('./dist/css'));
});

// monitoring source changes & autorun the task
gulp.task('watch', function () {
  gulp.watch('./src/scss/*.scss', ['scss']);
  gulp.watch('./src/**/*.jade', ['jade']);
});

// default task
gulp.task('default', ['scss','jade','watch']);