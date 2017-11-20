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
  jsonEdit = require('gulp-json-editor');

// パス
const
  assets = './assets/',
  dist = './dist/';

const
  config = require( assets + 'data/config.json' );

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
  inlineOption = {
    applyStyleTags: false,
    removeStyleTags: false
  },
  host = {
    local: 'localhost',
    ip: '0.0.0.0'
  };

let
  page = [];

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


/* pug */
gulp.task('pug', () =>
  gulp.src( [ assets + 'pug/**/*.pug', '!' + assets + 'pug/module/**/*.pug', '!' + assets + 'pug/list.pug' ] )
    // 共通データの読み込み
    .pipe(data( file => {
      return setJson( assets + 'data/config.json' );
    }))
    // 各データの読み込み
    .pipe(data( file => {
      let c, filename, filepath;
      if (file.path.length !== 0) {
        c = file.path.split('\\').join('/');
        filename = c.split('/pug/')[1].replace('.pug', '');
        filepath = assets + 'data/' + filename + '.json';
        if ( isExistFile(filepath) ){
          let pagePri = setJson(filepath);
          console.log('1',pagePri);
          page.push( {
            "pageid": filename,
            "title": pagePri.mail.title,
            "description": pagePri.mail.description
          } )
          console.log('2',page)
        }
        if ( isExistFile(filepath) ) return setJson(filepath);
      }
    }))
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(pug( pugOptions ))
    .pipe(fileInclude())
    .pipe(gulp.dest( dist ))
);

/* jsonEdit */
gulp.task('jsonEdit', () =>
  gulp.src( assets + 'data/config.json' )
    .pipe(jsonEdit(
      json => {
        console.log(page);
        json.page = page;
        return json;
      }
    ))
    .pipe(gulp.dest( assets + 'data/' ))
)

/* build list index */
gulp.task('buildlist', () =>
  gulp.src( [ assets + 'pug/list.pug' ] )
    // データの読み込み
    .pipe(data( file => {
      return setJson( assets + 'data/config.json' );
    }))
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(pug( pugOptions ))
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
  callback => runSequence( 'pug', 'jsonEdit', 'inline', 'buildlist', callback )
);
/* build */
gulp.task(
  'build',
  callback => runSequence( 'stylus', 'pug', 'jsonEdit', 'inline', 'buildlist', callback )
);

/* watch */
gulp.task('watch', () => {
  gulp.watch( [ assets + 'pug/**/*.pug', assets + 'data/**/*.json' ], ['htmlbuild'] );
  gulp.watch( [ assets + 'styl/**/*.styl' ], ['cssbuild'] );
});

/* default */
gulp.task(
  'default',
  callback => runSequence( 'build', 'server', 'watch', callback )
);