const gulp = require('gulp'); // 引入 gulp
const $ = require('gulp-load-plugins')(); // just use for gulp-xxx
const autoprefixer = require('autoprefixer');
const mainBowerFiles = require('main-bower-files');
const browserSync = require('browser-sync').create();
const minimist = require('minimist');
const gulpSequence = require('gulp-sequence');

const srcs = {
  jade: './src/**/*.jade',
  scss: './src/scss/*.scss',
  js: './src/js/**/*.js',
  img: './src/images/*',
  _static: ['./src/**/*.md']
};

const dist = './dist/';

const envs = { prod: 'production', dev: 'develop' };
const envOptions = {
  string: 'env',
  default: { env: envs.dev }
};
const options = minimist(process.argv.slice(2), envOptions);
console.log(options);

const isEqualsEnv = (env) => {
  return options.env === env;
};
const pipeByEnv = (env, fn) => {
  return $.if(isEqualsEnv(env), fn);
};
const isEnvProd = isEqualsEnv(envs.prod);

// 資料夾reset
gulp.task('clean', function() {
  return gulp.src(['./.tmp', './dist'], { read: false })
    .pipe($.clean());
});

// 加入任務
gulp.task('copy-static', function() {
  // copy src/*.* to dist/
  return gulp.src(srcs._static)
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
    .pipe(pipeByEnv(envs.prod, $.htmlReplace({
      'css': dist + 'css/all.min.css',
      'js': dist + 'js/all.min.js',
      'vendors': dist + 'js/vendor.min.js'
    }, {
      resolvePaths: true
    })))
    .pipe(gulp.dest(dist))
    .pipe(browserSync.stream());
});

gulp.task('scss', function() {
  const plugins = [
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
    .pipe(pipeByEnv(envs.prod, $.minifyCss())) // put it after compiled
    .pipe(pipeByEnv(envs.prod, $.rename(function(path) {
      path.basename += ".min";
      path.extname = ".css";
    })))
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
    .pipe(pipeByEnv(envs.prod, $.uglify({ // put it after compiled & concated
      compress: {
        drop_console: true
      }
    })))
    .pipe(pipeByEnv(envs.prod, $.rename(function(path) {
      path.basename += ".min";
      path.extname = ".js";
    })))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(dist + 'js'))
    .pipe(browserSync.stream());
});

gulp.task('bower', function() {
  const file = isEnvProd ? 'vue.min.js' : 'vue.js';
  return gulp.src(mainBowerFiles({
      "overrides": {
        "vue": { // 套件名稱
          "main": '../../bower_components/vue/dist/' + file // 取用的資料夾路徑
        }
      }
    }))
    .pipe(gulp.dest('./.tmp/vendors'))
});

gulp.task('vendorsJs', ['bower'], function() {
  return gulp.src('./.tmp/vendors/**/*.js')
    .pipe($.order([ // dependency order by index
      'jquery.js',
      'bootstrap.js'
    ]))
    .pipe($.concat('vendors.js'))
    .pipe(pipeByEnv(envs.prod, $.uglify())) // put it after concated
    .pipe(pipeByEnv(envs.prod, $.rename(function(path) {
      path.basename += ".min";
      path.extname = ".js";
    })))
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
  .pipe(pipeByEnv(envs.prod, $.imagemin()))
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
gulp.task('prod', gulpSequence('clean', ['copy-static', 'jade', 'scss', 'image-min'], 'babel', 'vendorsJs'));

// delpoy to github-pages:
gulp.task('deploy-ghp', ['prod'], function() {
  return gulp.src(dist + '**/*')
    .pipe($.ghPages());
});

// default task
gulp.task('default', gulpSequence(
  'clean', [
    'copy-static',
    'scss',
    'jade',
    'image-min'
  ],
  'babel',
  'vendorsJs',
  'browser-sync',
  'watch'
), );