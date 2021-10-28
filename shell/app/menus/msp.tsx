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

import { goTo } from 'common/utils';
import i18n from 'i18n';
import { List as IconList, DataDisplay as IconDataDisplay } from '@icon-park/react';
import React from 'react';

export const getMspMenu = () => {
  return [
    // {
    //   href: goTo.resolve.mspRoot(),
    //   icon: <IconServer />,
    //   text: i18n.t('msp:microService governance'),
    // },
    {
      href: goTo.resolve.mspRootOverview(),
      icon: <IconDataDisplay />,
      text: i18n.t('overview'),
      subtitle: i18n.t('Overview'),
    },
    {
      href: goTo.resolve.mspProjects(),
      icon: <IconList />,
      text: i18n.t('project list'),
      subtitle: i18n.t('Project'),
    },
  ];
};
