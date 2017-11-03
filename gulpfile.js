var gulp = require('gulp'); // 引入 gulp
var $ = require('gulp-load-plugins')(); // just use for gulp-xxx
var autoprefixer = require('autoprefixer');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync').create();

var srcs = {
  html: './src/**/*.html',
  jade: './src/**/*.jade',
  scss: './src/scss/*.scss',
  js: './src/js/**/*.js',
};

var dist = './dist/';

// 加入任務
gulp.task('copyHTML', function() {
  // copy src/*.* to dist/
  return gulp.src(srcs.html)
    .pipe($.plumber())
    .pipe(gulp.dest(dist));
});

gulp.task('jade', function() {
  // var YOUR_LOCALS = {};

  // gulp.src('./src/*.jade')
  gulp.src(srcs.jade) // for all sub-dirs & files belong to src
    .pipe($.plumber())
    .pipe($.jade({
      pretty: true // Don't compress
    }))
    .pipe(gulp.dest(dist))
});

gulp.task('scss', function() {
  var plugins = [
    autoprefixer({
      browsers: [
        'last 1 version',
        '> 5%',
        'ie 6-8',
        'Firefox > 20'
      ]
    })
  ];

  return gulp.src(srcs.scss)
    .pipe($.sourcemaps.init())
    .pipe($.plumber())
    .pipe($.sass().on('error', $.sass.logError)) // compile to css
    .pipe($.postcss(plugins))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(dist + 'css'));
});

gulp.task('babel', () =>
  gulp.src(srcs.js)
  .pipe($.sourcemaps.init())
  .pipe($.babel({
    presets: ['es2015']
  }))
  .pipe($.concat('all.js'))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest(dist + 'js'))
);

gulp.task('bower', function() {
  return gulp.src(mainBowerFiles())
    .pipe(gulp.dest('./.tmp/vendors'))
});

gulp.task('vendorsJs', ['bower'], function() {
  return gulp.src('./.tmp/vendors/**/*.js')
    .pipe($.order([ // dependency order by index
      'jquery.js',
      'bootstrap.js'
    ]))
    .pipe($.concat('vendors.js'))
    .pipe(gulp.dest(dist + 'js'));
});

// Static server
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: dist
    }
  });
});

// monitoring source changes & autorun the task
gulp.task('watch', function() {
  gulp.watch(srcs.scss, ['scss']);
  gulp.watch(srcs.jade, ['jade']);
  gulp.watch(srcs.js, ['babel']);
});

// default task
gulp.task('default', [
  'scss',
  'jade',
  'babel',
  'vendorsJs',
  'browser-sync',
  'watch'
]);