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
    modifyVars: { 'root-entry-name': 'default', '@primary-color': '#051233' },
    ...lessConfig,
  };
  return less
    .render(lessContent, lessOpts)
    .then((result) => postcss([autoprefixer]).process(result.css, { from: undefined }))
    .then((r) => r.css);
}

module.exports = transformLess;
