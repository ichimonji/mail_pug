/*jshint esversion: 6 */

const
  // 各種プラグインの読み込み
  gulp = require('gulp'),
  del = require('del'),
  data = require('gulp-data'),
  notify = require('gulp-notify'),
  plumber = require('gulp-plumber'),
  pug = require('gulp-pug'),
  stylus = require('gulp-stylus'),
  cleanCSS = require('gulp-clean-css'),
  inline = require('gulp-inline-css'),
  server = require('gulp-webserver'),
  nib = require('nib'),
  fs = require('fs'),
  fileInclude = require('gulp-file-include'),
  runSequence = require('run-sequence'),
  jsonStylus = require('gulp-json-stylus'),
  through = require('through2'),
  replace = require('gulp-replace');

const
  rep = require('./replacing.js');

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
      return true;
    } catch(err) {
      if(err.code === 'ENOENT') return false;
    }
  };

// 各種オプション
const
  pugOptions = {
    pretty: true,
    basedir: 'mail_pug/assets'
  },
  pugMinifyOptions = {
    pretty: false,
    basedir: 'mail_pug/assets'
  },
  inlineOption = {
    applyStyleTags: false,
    removeStyleTags: false
  },
  host = {
    local: 'localhost',
    ip: '0.0.0.0'
  };

/* server */
gulp.task('server', () => {
  gulp.src(dist)
    .pipe(server({
      host: host.local,
      port: 8000,
      livereload: true,
      fallback: 'index.html',
      open: true
    }));
});

/* clean */
gulp.task('clean', callback => del(dist, callback) );

/* pug */
gulp.task('pug', () =>
  gulp.src( [ assets + 'template/**/*.pug' ] )
    // 共通データの読み込み
    .pipe(data( file => setJson( assets + 'data/config.json' ) ))
    // 各データの読み込み
    .pipe(data( file => {
      let c, filename, filepath;
      if (file.path.length !== 0) {
        c = file.path.split('\\').join('/');
        filename = c.split('/template/')[1].replace('.pug', '');
        filepath = assets + 'template/' + filename + '.json';
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
  gulp.src( [ assets + 'template/**/*.pug', '!' + assets + 'template/module/**/*.pug' ] )
    // 共通データの読み込み
    .pipe(data( file => setJson( assets + 'data/config.json' ) ))
    // 各データの読み込み
    .pipe(data( file => {
      let c, filename, filepath;
      if (file.path.length !== 0) {
        c = file.path.split('\\').join('/');
        filename = c.split('/template/')[1].replace('.pug', '');
        filepath = assets + 'template/' + filename + '.json';
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
  gulp.src( [ assets + 'template/**/*.styl' ] )
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(stylus({
      use: nib()
    }))
    .pipe(gulp.dest( dist ))
);

/* cssMinify */
gulp.task('cssMinify', () =>
  gulp.src( [ dist + '**/*.css' ] )
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(cleanCSS())
    .pipe(gulp.dest( dist ))
);

/* inline */
gulp.task('inline', () =>
  gulp.src( dist + '**/*.html' )
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(inline(inlineOption))
    .pipe(gulp.dest( dist ))
);

/* replace */
gulp.task('replace', () =>
  gulp.src( dist + '**/*.html' )
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(
      through.obj(function (file, enc, cb) {
        var arr = rep.replaceArr;
        var reg;
        for( var i in arr ){
          reg = new RegExp(arr[i][0], 'g');
          file.contents = new Buffer(file.contents.toString().replace(reg, arr[i][1]));
        }
        cb(null, file);
      })
    )
    .pipe(gulp.dest( dist ))
);

/* replaceminify */
gulp.task('replaceminify', () =>
  gulp.src( dist + '**/*.html' )
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(
      through.obj(function (file, enc, cb) {
        var arr = rep.replaceArrMinify;
        var reg;
        for( var i in arr ){
          reg = new RegExp(arr[i][0], 'g');
          file.contents = new Buffer(file.contents.toString().replace(reg, arr[i][1]));
        }
        file.contents = new Buffer(file.contents.toString().replace(/style\="(.*?)"/g, function(r,r1){return "style=\""+r1.replace(/([:;]) /g,'$1')+"\"";}));
        cb(null, file);
      })
    )
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
  callback => runSequence( 'stylus', 'pug', 'inline', 'replace', callback )
);
/* minify */
gulp.task(
  'minify',
  callback => runSequence( 'stylus', 'cssMinify', 'pugMinify', 'inline', 'replace',  'replaceminify',  callback )
);

/* watch */
gulp.task('watch', () => {
  gulp.watch( [ assets + '**/*.*' ], ['build'] );
});

/* default */
gulp.task(
  'default',
  callback => runSequence( 'clean', 'build', 'server', 'watch', callback )
);