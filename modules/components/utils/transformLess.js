/* eslint-disable import/no-extraneous-dependencies */
const less = require('less');
const path = require('path');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const NpmImportPlugin = require('less-plugin-npm-import');

function transformLess(lessContent, lessFilePath, config = {}) {
  const { cwd = process.cwd() } = config;
  const { compile: { lessConfig } = {} } = {};
  const resolvedLessFile = path.resolve(cwd, lessFilePath);

  // Do less compile
  const lessOpts = {
    paths: [path.dirname(resolvedLessFile)],
    filename: resolvedLessFile,
    plugins: [new NpmImportPlugin({ prefix: '~' })],
    javascriptEnabled: true,
    modifyVars: { 'root-entry-name': 'default', '@primary-color': '#302647' },
    ...lessConfig,
  };
  return less
    .render(lessContent, lessOpts)
    .then((result) => postcss([autoprefixer]).process(result.css, { from: undefined }))
    .then((r) => r.css);
}

module.exports = transformLess;
