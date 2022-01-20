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

import React from 'react';
import i18n from 'i18n';
import { ErdaAlert } from 'common';
import ReleaseProtocol from './release-protocol';

import './application.scss';

const replaceWithLink = (str, href) => {
  const matchArr = str.match(/\[.*?\]/g);
  const reg = new RegExp(matchArr.join('|').replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g');
  const strArr = str.split(reg);
  const result = [];
  strArr.forEach((item, index) => {
    result.push(item);
    if (index !== strArr.length - 1) {
      result.push(
        <span className="text-purple-deep mx-1 cursor-pointer" onClick={() => window.open(href)}>
          {matchArr[index].replace(/\[|]/g, '')}
        </span>,
      );
    }
  });
  return <div className="whiteSpace-nowrap">{result}</div>;
};

const ProjectRelease = () => {
  return (
    <div className="h-full flex flex-col">
      <ErdaAlert
        showOnceKey="application-release-list"
        message={replaceWithLink(i18n.t('dop:Applications release list top desc'), 'https://semver.org/lang/zh-CN/')}
      />

      <ReleaseProtocol isProjectRelease={false} />
    </div>
  );
};

export default ProjectRelease;
