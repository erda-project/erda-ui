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

import { Icon as CustomIcon } from 'common';
import { Config } from '@icon-park/react';
import i18n from 'i18n';
import React from 'react';

export const getSideMenu = ({ rootPath }: { rootPath: string }) => {
  const sideMenu = [
    {
      href: `${rootPath}/overview`,
      icon: <CustomIcon type="overview" />,
      text: i18n.t('workBench:addon info'),
    },
    {
      href: `${rootPath}/settings`,
      icon: <Config />,
      text: i18n.t('workBench:addon setting'),
    },
  ];
  return sideMenu;
};
