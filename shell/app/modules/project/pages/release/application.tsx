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
import replaceWithLink from 'app/common/utils/i18n-replace-link';

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
