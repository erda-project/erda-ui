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

import i18n from 'i18n';
import { goTo } from 'common/utils';
import { filterMenu, MENU_SCOPE } from './util';
import {
  ListTwo as IconListTwo,
  DataDisplay as IconDataDisplay,
  DataAll as IconDataAll,
  DashboardCar as IconDashboardCar,
} from '@icon-park/react';
import React from 'react';

export const getCmpMenu = () => {
  return filterMenu(
    [
      {
        key: 'cmpOverview',
        href: goTo.resolve.cmpClusterOverview(),
        icon: <IconDataDisplay />,
        text: i18n.d('集群'),
        subtitle: i18n.d('集群'),
        subMenu: [
          {
            key: 'cmpClusterOverview',
            href: goTo.resolve.cmpClusterOverview(),
            text: i18n.t('cluster overview'),
          },
          {
            key: 'cmpClusterManage',
            href: goTo.resolve.cmpClusterManage(),
            text: i18n.t('cmp:cluster management'),
          },
        ],
      },
      {
        key: 'cmpResources',
        href: goTo.resolve.cloudSource(),
        icon: <IconDataAll />,
        text: i18n.t('resource management'),
        subtitle: i18n.t('Resource'),
        subMenu: [
          {
            key: 'cmpCloudSource',
            href: goTo.resolve.cloudSource(),
            text: i18n.t('cloud source'),
          },
          {
            key: 'cmpCloudSource',
            href: goTo.resolve.cmpAddon(),
            text: i18n.t('addon service'),
          },
        ],
      },
      {
        key: 'cmpDomain',
        href: goTo.resolve.cmpDomain(),
        icon: <IconListTwo />,
        text: i18n.d('域名管理'),
        subtitle: i18n.d('域名'),
      },
      {
        key: 'cmpOP',
        href: goTo.resolve.cmpOPAlarmRecord(),
        icon: <IconDashboardCar />,
        text: i18n.d('运维'),
        subtitle: i18n.d('运维'),
        prefix: `${goTo.resolve.cmpOPRoot()}/`,
      },
    ],
    MENU_SCOPE.cmp,
  );
};
