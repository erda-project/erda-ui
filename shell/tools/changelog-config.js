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

/* eslint-disable no-param-reassign */
const compareFunc = require('compare-func');
const Q = require('q');
const readFile = Q.denodeify(require('fs').readFile);
const { resolve } = require('path');

// let pkgJson = {};
// // const gufg = require('github-url-from-git');

// try {
//   pkgJson = require(resolve(process.cwd(), './package.json'));
// } catch (err) {
//   console.error('no root package.json found');
// }

// function issueUrl() {
//   // eslint-disable-next-line no-bitwise
//   if (pkgJson.repository && pkgJson.repository.url && ~pkgJson.repository.url.indexOf('github.com')) {
//     const gitUrl = gufg(pkgJson.repository.url);

//     if (gitUrl) {
//       return `${gitUrl}/issues/`;
//     }
//   }
// }

const parserOpts = {
  headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
  headerCorrespondence: [
    'type',
    'scope',
    'subject',
  ],
  noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
  revertPattern: /^revert:\s([\s\S]*?)\s*This reverts commit (\w*)\./,
  revertCorrespondence: ['header', 'hash'],
};

const writerOpts = {
  transform(commit) {
    let discard = true;

    commit.notes.forEach((note) => {
      note.title = 'BREAKING CHANGES';
      discard = false;
    });

    // git merge 自动生成的 commit 没有 type，过滤掉
    if (!commit.type) {
      return;
    }

    if (commit.type.startsWith('feat')) {
      commit.type = 'Features';
    } else if (commit.type.startsWith('fix')) {
      commit.type = 'Bug Fixes';
    } else if (commit.type.startsWith('refactor')) {
      commit.type = 'Refactor';
    } else if (discard) { // only match type before here
      return;
    } else if (commit.type === 'docs') {
      commit.type = 'Documentation';
    } else if (commit.type === 'style') {
      commit.type = 'Styles';
    } else if (commit.type === 'test') {
      commit.type = 'Tests';
    } else if (commit.type === 'chore') {
      commit.type = 'Chores';
    } else if (commit.type === 'perf') {
      commit.type = 'Performance Improvements';
    } else if (commit.type === 'revert') {
      commit.type = 'Reverts';
    }

    // only body to generate changelog content
    if (!commit.body) {
      return;
    }
    commit.subject = `${commit.body}`;

    if (commit.scope === '*') {
      commit.scope = '';
    }

    if (typeof commit.hash === 'string') {
      commit.hash = commit.hash.substring(0, 7);
    }

    // if (typeof commit.subject === 'string') {
    //   const url = issueUrl();
    //   if (url) {
    //     // GitHub issue URLs.
    //     commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
    //       issues.push(issue);
    //       return `[#${issue}](${url}${issue})`;
    //     });
    //   }
    //   // GitHub user URLs.
    //   commit.subject = commit.subject.replace(/@([a-zA-Z0-9_]+)/g, '[@$1](https://github.com/$1)');
    //   commit.subject = commit.subject;
    // }

    // remove references that already appear in the subject
    // commit.references = commit.references.filter((reference) => {
    //   if (issues.indexOf(reference.issue) === -1) {
    //     return true;
    //   }

    //   return false;
    // });

    return commit;
  },
  groupBy: 'type',
  commitGroupsSort: 'title',
  commitsSort: ['scope', 'subject'],
  noteGroupsSort: 'title',
  notesSort: compareFunc,
};

const tplDir = '../node_modules/conventional-changelog-angular/templates';
module.exports = Q.all([
  readFile(resolve(__dirname, `${tplDir}/template.hbs`), 'utf-8'),
  readFile(resolve(__dirname, `${tplDir}/header.hbs`), 'utf-8'),
  readFile(resolve(__dirname, `${tplDir}/commit.hbs`), 'utf-8'),
  readFile(resolve(__dirname, `${tplDir}/footer.hbs`), 'utf-8'),
])
  .spread((template, header, commit, footer) => {
    writerOpts.mainTemplate = template;
    writerOpts.headerPartial = header;
    writerOpts.commitPartial = commit;
    writerOpts.footerPartial = footer;

    return {
      parserOpts,
      writerOpts,
      // context: {
      //   host: 'http://git.terminus.io',
      // },
    };
  });
