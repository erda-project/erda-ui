/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const gulp = require('gulp');
const path = require('path');
const rimraf = require('rimraf');
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const merge2 = require('merge2');
const through2 = require('through2');
// const webpack = require('webpack');
const transformLess = require('./utils/transformLess');
const { compilerOptions } = require('./tsconfig.json');

const tsConfig = {
  noUnusedParameters: true,
  noUnusedLocals: true,
  strictNullChecks: true,
  moduleResolution: 'node',
  declaration: true,
  declarationMap: true,
  preserveSymlinks: true,
  allowSyntheticDefaultImports: true,
  ...compilerOptions,
};
const babelConfig = require('./babel.config');

const source = ['src/**/*.{js,ts,jsx,tsx}'];
const base = path.join(process.cwd(), 'src');
function getProjectPath(filePath) {
  return path.join(process.cwd(), filePath);
}
const libDir = getProjectPath('lib');
const esDir = getProjectPath('es');

gulp.task('compile-with-es', (done) => {
  console.log('Compile to es...');
  compile(false).on('finish', done);
});

gulp.task('compile-with-lib', (done) => {
  console.log('Compile to lib...');
  compile().on('finish', done);
});
gulp.task('compile', gulp.parallel('compile-with-es', 'compile-with-lib'));

function compile(modules) {
  const targetDir = modules === false ? esDir : libDir;
  rimraf.sync(targetDir);

  // =============================== LESS ===============================
  const less = gulp
    .src(['src/**/*.less'])
    .pipe(
      through2.obj(function (file, encoding, next) {
        // Replace content
        const cloneFile = file.clone();
        const content = file.contents.toString().replace(/^\uFEFF/, '');

        cloneFile.contents = Buffer.from(content);

        // Clone for css here since `this.push` will modify file.path
        const cloneCssFile = cloneFile.clone();

        this.push(cloneFile);

        // Transform less file
        if (file.path.match(/(\/|\\)style(\/|\\)index\.less$/)) {
          transformLess(cloneCssFile.contents.toString(), cloneCssFile.path)
            .then((css) => {
              cloneCssFile.contents = Buffer.from(css);
              cloneCssFile.path = cloneCssFile.path.replace(/\.less$/, '.css');
              this.push(cloneCssFile);
              next();
            })
            .catch((e) => {
              console.error(e);
            });
        } else {
          next();
        }
      }),
    )
    .pipe(gulp.dest(modules === false ? esDir : libDir));
  // const assets = gulp
  //  .src(['components/**/*.@(png|svg)'])
  //  .pipe(gulp.dest(modules === false ? esDir : libDir));

  const { js, dts } = gulp.src(source, { base }).pipe(ts(tsConfig));
  const dtsFilesStream = dts.pipe(gulp.dest(targetDir));
  let jsFilesStream = js;
  if (modules !== false) {
    jsFilesStream = js.pipe(babel(babelConfig));
  }
  jsFilesStream = jsFilesStream.pipe(gulp.dest(targetDir));
  return merge2([less, jsFilesStream, dtsFilesStream]);
}

/*
function dist(done) {
  rimraf.sync(getProjectPath('dist'));
  process.env.RUN_ENV = 'PRODUCTION';
  const webpackConfig = require(getProjectPath('webpack.config.js'));
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();
    const { dist: { finalize } = {}, bail } = getConfig();

    if (stats.hasErrors()) {
      (info.errors || []).forEach((error) => {
        console.error(error);
      });
      // https://github.com/ant-design/ant-design/pull/31662
      if (bail) {
        process.exit(1);
      }
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

    const buildInfo = stats.toString({
      colors: true,
      children: true,
      chunks: false,
      modules: false,
      chunkModules: false,
      hash: false,
      version: false,
    });
    console.log(buildInfo);

    // Additional process of dist finalize
    if (finalize) {
      console.log('[Dist] Finalization...');
      finalize();
    }

    done(0);
  });
}
*/
