var gulp = require('gulp'); // 引入 gulp
var jade = require('gulp-jade');

// 加入任務
gulp.task('copyHTML', function () {
	// copy src/*.* to dist/
	return gulp.src('./src/**')
	.pipe(gulp.dest('./dist/'));
});

gulp.task('jade', function() {
  // var YOUR_LOCALS = {};
 
  // gulp.src('./src/*.jade')
  gulp.src('./src/**/*.jade') // for all sub-dirs & files belong to src
    .pipe(jade({
    	pretty: true // Don't compress
    }))
    .pipe(gulp.dest('./dist/'))
});