// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const gulp = require('gulp');
const { watch } = require('gulp');
const path = require('path');
const ts = require('gulp-typescript');
const merge2 = require('merge2');
const { compilerOptions } = require('./tsconfig.json');
const changed = require('gulp-changed');
const through2 = require('through2');
const transformLess = require('./utils/transformLess');

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
function getProjectPath(filePath) {
  return path.join(process.cwd(), filePath);
}
const esDir = getProjectPath('es');

function buildTask(done) {
  // place code for your default task here
  const arg = process.argv.slice(4);
  if (arg.length && arg.includes('--watch')) {
    watch(source, { ignoreInitial: false }, compileEs);
  } else {
    compileEs().on('finish', done);
  }
}

function compileEs() {
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

  return merge2([gulp.src(source).pipe(changed(esDir)).pipe(ts(tsConfig)), less]).pipe(gulp.dest(esDir));
}

exports.default = buildTask;
