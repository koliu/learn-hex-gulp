var gulp = require('gulp'); // 引入 gulp

// 加入任務
gulp.task('copyHTML', function () {
	// copy src/*.* to dist/
	return gulp.src('./src/**')
	.pipe(gulp.dest('./dist/'));
});