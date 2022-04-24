/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const gulp = require('gulp');
const { watch } = require('gulp');
const path = require('path');
const rimraf = require('rimraf');
const ts = require('gulp-typescript');
const merge2 = require('merge2');
const through2 = require('through2');
const transformLess = require('./utils/transformLess');
const { compilerOptions } = require('./tsconfig.json');
const changed = require('gulp-changed');

const tsConfig = {
  noUnusedParameters: true,
  noUnusedLocals: true,
  strictNullChecks: true,
  moduleResolution: 'node',
  // declaration: true,
  // preserveSymlinks: true,
  // allowSyntheticDefaultImports: true,
  // declarationMap: true,
  ...compilerOptions,
};

const source = ['src/**/*.{js,ts,jsx,tsx}'];
const base = path.join(process.cwd(), 'src');
function getProjectPath(filePath) {
  return path.join(process.cwd(), filePath);
}
const esDir = getProjectPath('es');

function watchTask() {
  // place code for your default task here
  watch('./src/**/*', { ignoreInitial: false }, compileEs);
}

function compileEs() {
  return merge2(gulp.src('./src/**/*').pipe(changed(esDir)).pipe(ts(tsConfig))).pipe(gulp.dest(esDir));
}

function compile() {
  const targetDir = esDir;
  rimraf.sync(targetDir);

  // =============================== LESS ===============================
  const less = gulp.src(['src/**/*.less']).pipe(
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
  );

  const { js, dts } = gulp.src(source, { base }).pipe(ts(tsConfig));
  return merge2([less, js, dts]);
}

exports.default = watchTask;
