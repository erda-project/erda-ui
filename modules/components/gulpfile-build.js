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
  return merge2(gulp.src(source).pipe(changed(esDir)).pipe(ts(tsConfig))).pipe(gulp.dest(esDir));
}

exports.default = buildTask;
