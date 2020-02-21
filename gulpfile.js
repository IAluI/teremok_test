'use strict';

const path = require('path');
const fs = require('fs');

const webpack = require('webpack');
const notifier = require('node-notifier');
const del = require('del');
const browserSync = require('browser-sync').create();

const gulp = require('gulp');
const gulplog = require('gulplog');
const prettier = require('@bdchauvette/gulp-prettier');
const svgSprite = require('gulp-svg-sprite');
const rename = require('gulp-rename');
const gulpIf = require('gulp-if');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const paths = {
  pug: {
    src: "./src/pages/*.pug",
    dist: "../IAluI.github.io/",
    watch: ["./src/pages/*.pug", "./src/pageTemplates/*.pug"]
  },
  fonts: {
    src: "./src/fonts/**/*.{ttf,otf,woff,woff2}",
    dist: "../IAluI.github.io/fonts/",
    watch: "./src/fonts/**/*.{ttf,otf,woff,woff2}"
  },
  styles: {
    src: "./src/scss/*.scss",
    dist: "../IAluI.github.io/css/",
    watch: "./src/scss/*.scss"
  },
  images: {
    src: "./src/img/*.{jpg,jpeg,png,gif,svg,ico}",
    dist: "../IAluI.github.io/img/",
    watch: "./src/img/*.{jpg,jpeg,png,gif,svg,ico}"
  },
  svgSprite: {
    src: "./src/icons_v/*.svg",
    dist: "../IAluI.github.io/img/",
    watch: ["./src/icons_v/*.svg", "./src/icons_v/scssSpriteTemplate.mustache"]
  }
};

gulp.task('clean', (cb) => {
  del.sync([
    '../IAluI.github.io/**/*',
    './tmp/**/*'
  ], {
    force: true,
  });
  if (!fs.existsSync(path.resolve(__dirname, 'tmp'))) {
    fs.mkdirSync(path.resolve(__dirname, 'tmp'));
  }
  fs.closeSync(fs.openSync(path.resolve(__dirname, 'tmp/_icons.scss'), 'w'));
  cb();
});

gulp.task('reload', (cb) => {
  browserSync.reload();
  cb();
});

gulp.task('pug', () => {
  return gulp.src(paths.pug.src)
    .pipe(pug())
    .pipe(prettier({
      htmlWhitespaceSensitivity: 'ignore'
    }))
    .pipe(rename({
      dirname: ''
    }))
    .pipe(gulp.dest(paths.pug.dist));
    //.pipe(browserSync.reload({ stream: true }));
});

gulp.task('styles', () => {
  return gulp.src(paths.styles.src)
    .pipe(sass({
      includePaths: [
        process.cwd()
      ]
    }))
    .pipe(autoprefixer())
    .pipe(gulpIf(!isDevelopment, cleanCSS()))
    .pipe(gulp.dest(paths.styles.dist))
    .pipe(browserSync.stream());
});

gulp.task('fonts', () => {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dist))
    .pipe(browserSync.stream());
});

gulp.task('images', () => {
  return gulp.src(paths.images.src)
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true,
        optimizationLevel: 3,
      }),
      imagemin.optipng({
        optimizationLevel: 7
      }),
      imagemin.svgo({
        plugins: [
          {removeViewBox: false},
          {cleanupIDs: false}
        ]
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
    ]))
    .pipe(gulp.dest(paths.images.dist))
    .pipe(browserSync.stream());
});

gulp.task('svgSprite', () => {
  return gulp.src(paths.svgSprite.src)
    .pipe(svgSprite({
      mode: {
        symbol: {
          dest: '.',
          sprite: 'icons.svg',
          render: {
            scss: {
              dest: '_icons.scss',
              template: 'src/icons_v/scssSpriteTemplate.mustache'
            }
          },
          example: isDevelopment,
        }
      }
    }))
    .pipe(gulp.dest(paths.svgSprite.dist))
    .pipe(browserSync.stream());
});

gulp.task('webpack', function(callback) {
  let options = {
    mode: isDevelopment ? 'development' : 'production',
    entry: {
      main: path.resolve(__dirname, 'src/js/main.js'),
    },
    output: {
      path: path.resolve(__dirname, '../IAluI.github.io/js'),
    },
    watch: isDevelopment,
    watchOptions: {
      aggregateTimeout: 500,
      ignored: /node_modules/
    },
    devtool: isDevelopment ? 'cheap-module-inline-source-map' : false,
    resolve: {
      modules: [
        'node_modules',
        path.resolve(__dirname, 'src')
      ]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: function(modulePath) {
            let includeModules = [
              'swiper',
              'dom7'
            ];
            return /node_modules/.test(modulePath) &&
              !includeModules.some((val) => {
                return new RegExp('node_modules\\\\' + val).test(modulePath);
              });
          },
          use: [/* {
            loader: 'echo-loader'
          },  */{
            loader: 'babel-loader'
          }]
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        /* jQuery: 'jquery',
        'window.jQuery': 'jquery', */
        /*Popper: ['popper.js', 'default']*/
      })
    ]
  };

  webpack(options, function(err, stats) {
    if (!err) {
      err = stats.toJson().errors[0];
    }
    if (err) {
      notifier.notify({
        title: 'Webpack',
        message: err
      });
      gulplog.error(err);
    } else {
      gulplog.info(stats.toString({
        colors: true
      }));
    }
    if (!options.watch && err) {
      callback(err);
    } else {
      callback();
      browserSync.reload();      
    }
  });
});

gulp.task('webserver', () => {
  browserSync.init({
    server: "../IAluI.github.io/",
    port: 4000,
  });

  gulp.watch(paths.pug.watch, gulp.series('pug', 'reload'));
  gulp.watch(paths.styles.watch, gulp.series('styles'));
  gulp.watch(paths.images.watch, gulp.series('images'));
  gulp.watch(paths.svgSprite.watch, gulp.series('svgSprite', 'styles'));
  gulp.watch(paths.fonts.watch, gulp.series('fonts'));
});

gulp.task('build',
  gulp.series(
    'clean',
    'svgSprite',
    gulp.parallel(
      'fonts',
      'images',
      'styles',
      'webpack',
      'pug'
    )
  )
);

gulp.task('default', gulp.series(
  'build',
  'webserver'
));
