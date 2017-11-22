const
  // 各種プラグインの読み込み
  gulp = require('gulp'),
  del = require('del'),
  data = require('gulp-data'),
  notify = require('gulp-notify'),
  plumber = require('gulp-plumber'),
  pug = require('gulp-pug'),
  stylus = require('gulp-stylus'),
  inline = require('gulp-inline-css'),
  server = require('gulp-webserver'),
  nib = require('nib'),
  fs = require('fs'),
  fileInclude = require('gulp-file-include'),
  runSequence = require('run-sequence'),
  jsonEdit = require('gulp-json-editor'),
  jsonStylus = require('gulp-json-stylus');

// パス
const
  assets = './assets/',
  dist = './dist/';

// 各種変数
let
  // jsonSet
  setJson = filepath => {
    return JSON.parse(fs.readFileSync( filepath, { encoding:"utf8" } ));
  },
  // file exist
  isExistFile = filepath => {
    try {
      fs.statSync(filepath);
      return true
    } catch(err) {
      if(err.code === 'ENOENT') return false
    }
  };

// 各種オプション
const
  pugOptions = {
    pretty: true,
    basedir: 'mail_pug/'
  },
  pugMinifyOptions = {
    pretty: false,
    basedir: 'mail_pug/'
  },
  inlineOption = {
    applyStyleTags: false,
    removeStyleTags: false
  },
  host = {
    local: 'localhost',
    ip: '0.0.0.0'
  };

let
  page = {};

/* server */
gulp.task('server', () => {
  gulp.src(dist)
    .pipe(server({
      host: host.local,
      port: 8000,
      livereload: true,
      fallback: 'list.html',
      open: true
    }));
});

/* clean */
gulp.task('clean', callback => del(dist, callback) );

/* pug */
gulp.task('pug', () =>
  gulp.src( [ assets + 'pug/**/*.pug', '!' + assets + 'pug/module/**/*.pug' ] )
    // 共通データの読み込み
    .pipe(data( file => setJson( assets + 'data/config.json' ) ))
    // 各データの読み込み
    .pipe(data( file => {
      let c, filename, filepath;
      if (file.path.length !== 0) {
        c = file.path.split('\\').join('/');
        filename = c.split('/pug/')[1].replace('.pug', '');
        filepath = assets + 'data/' + filename + '.json';
        if ( isExistFile(filepath) ) return setJson(filepath);
      }
    }))
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(pug( pugOptions ))
    .pipe(fileInclude())
    .pipe(gulp.dest( dist ))
);

/* pugMinify */
gulp.task('pugMinify', () =>
  gulp.src( [ assets + 'pug/**/*.pug', '!' + assets + 'pug/module/**/*.pug' ] )
    // 共通データの読み込み
    .pipe(data( file => setJson( assets + 'data/config.json' ) ))
    // 各データの読み込み
    .pipe(data( file => {
      let c, filename, filepath;
      if (file.path.length !== 0) {
        c = file.path.split('\\').join('/');
        filename = c.split('/pug/')[1].replace('.pug', '');
        filepath = assets + 'data/' + filename + '.json';
        if ( isExistFile(filepath) ) return setJson(filepath);
      }
    }))
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(pug( pugMinifyOptions ))
    .pipe(fileInclude())
    .pipe(gulp.dest( dist ))
);

/* stylus */
gulp.task('stylus', () =>
  gulp.src( [ assets + 'styl/**/*.styl', '!' + assets + 'styl/module/**/*.styl' ] )
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(stylus({
      use: nib()
    }))
    .pipe(gulp.dest( dist + 'css' ))
);

/* stylusMinify */
gulp.task('stylusMinify', () =>
  gulp.src( [ assets + 'styl/**/*.styl', '!' + assets + 'styl/module/**/*.styl' ] )
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(stylus({
      use: nib(),
      compress: true
    }))
    .pipe(gulp.dest( dist + 'css' ))
);


/* inline */
gulp.task('inline', () =>
  gulp.src( dist + '**/*.html' )
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(inline(inlineOption))
    .pipe(gulp.dest( dist ))
);

/* cssbuild */
gulp.task(
  'cssbuild',
  callback => runSequence( 'stylus', 'inline', callback )
);
/* htmlbuild */
gulp.task(
  'htmlbuild',
  callback => runSequence( 'pug', 'inline', callback )
);
/* build */
gulp.task(
  'build',
  callback => runSequence( 'stylus', 'pug', 'inline', callback )
);
/* minify */
gulp.task(
  'minify',
  callback => runSequence( 'stylusMinify', 'pugMinify', 'inline', callback )
);

/* watch */
gulp.task('watch', () => {
  gulp.watch( [ assets + 'pug/**/*.pug', assets + 'data/**/*.json' ], ['htmlbuild'] );
  gulp.watch( [ assets + 'styl/**/*.styl' ], ['cssbuild'] );
});

/* default */
gulp.task(
  'default',
  callback => runSequence( 'clean', 'build', 'server', 'watch', callback )
);