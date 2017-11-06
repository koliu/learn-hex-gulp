var gulp = require('gulp'); // 引入 gulp
var $ = require('gulp-load-plugins')(); // just use for gulp-xxx
var autoprefixer = require('autoprefixer');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync').create();
var minimist = require('minimist');
var gulpSequence = require('gulp-sequence');

var srcs = {
  html: './src/**/*.html',
  jade: './src/**/*.jade',
  scss: './src/scss/*.scss',
  js: './src/js/**/*.js',
  img: './src/images/*'
};

var dist = './dist/';

var envs = { prod: 'production', dev: 'develop' };
var envOptions = {
  string: 'env',
  default: { env: envs.dev }
};
var options = minimist(process.argv.slice(2), envOptions);
console.log(options);
var equalsEnv = (env, fn) => {
  return $.if(options.env === env, fn);
};

// 資料夾reset
gulp.task('clean', function() {
  return gulp.src(['./.tmp', './dist'], { read: false })
    .pipe($.clean());
});

// 加入任務
gulp.task('copyHTML', function() {
  // copy src/*.* to dist/
  return gulp.src(srcs.html)
    .pipe($.plumber())
    .pipe(gulp.dest(dist))
    .pipe(browserSync.stream());
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
    .pipe(browserSync.stream());
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
    .pipe(equalsEnv(envs.prod, $.minifyCss())) // put it after compiled
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(dist + 'css'))
    .pipe(browserSync.stream());
});

gulp.task('babel', () => {
  gulp.src(srcs.js)
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['es2015']
    }))
    .pipe($.concat('all.js'))
    .pipe(equalsEnv(envs.prod, $.uglify({ // put it after compiled & concated
      compress: {
        drop_console: true
      }
    })))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(browserSync.stream());
});

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
    .pipe(equalsEnv(envs.prod, $.uglify())) // put it after concated
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

gulp.task('image-min', () =>
  gulp.src(srcs.img)
  .pipe($.imagemin())
  .pipe(gulp.dest(dist + 'images'))
);

// monitoring source changes & autorun the task
gulp.task('watch', function() {
  gulp.watch(srcs.scss, ['scss']);
  gulp.watch(srcs.jade, ['jade']);
  gulp.watch(srcs.js, ['babel']);
});

// 1. run 'clean'
// 2. run 'jade', 'scss', 'image-min' in parallel;  after 'clean'; 
// 3. run 'babel' after 'jade', 'scss', 'image-min'; 
// 4. run 'vendorsJs' after 'babel'. 
gulp.task('prod', gulpSequence('clean', ['jade', 'scss', 'image-min'], 'babel', 'vendorsJs'));


// default task
gulp.task('default', gulpSequence(
  'clean', [
    'scss',
    'jade',
    'image-min'
  ],
  'babel',
  'vendorsJs',
  'browser-sync',
  'watch'
), );