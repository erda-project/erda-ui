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
import { filterMenu, MENU_SCOPE } from './util';

export const getDataCenterMenu = () => {
  return filterMenu([
    {
      key: 'dataCenterOverview',
      href: '/dataCenter/overview',
      icon: 'qyzl',
      text: i18n.t('cluster overview'),
    },
    {
      key: 'dataCenterResources',
      href: '/dataCenter/clusters',
      icon: 'zczx',
      text: i18n.t('resources'),
      subMenu: [
        {
          key: 'dataCenterCluster',
          href: '/dataCenter/clusters',
          text: i18n.t('clusters'),
        },
        {
          key: 'dataCenterCloudSource',
          href: '/dataCenter/cloudSource',
          text: i18n.t('cloud source'),
        },
        {
          key: 'dataCenterResources',
          href: '/dataCenter/domain',
          text: i18n.t('runtime:manage domain'),
        },
      ],
    },
    {
      key: 'dataCenterServices',
      href: '/dataCenter/services',
      icon: 'wfw2',
      text: i18n.t('services & jobs'),
      subMenu: [
        {
          href: '/dataCenter/services',
          text: i18n.t('services'),
        },
        {
          href: '/dataCenter/addon',
          text: i18n.t('addon service'),
        },
        {
          href: '/dataCenter/jobs',
          text: i18n.t('job catalogue'),
        },
      ],
    },
    {
      key: 'dataCenterDashboard',
      href: '/dataCenter/customDashboard',
      icon: 'jsc',
      text: i18n.t('org:O & M dashboard'),
    },
    {
      key: 'dataCenterReport',
      href: '/dataCenter/report',
      icon: 'module-log',
      text: i18n.t('O & M report'),
    },
    {
      key: 'dataCenterAlarm',
      href: '/dataCenter/alarm',
      icon: 'jkgj',
      text: i18n.t('O & M alarm'),
      subMenu: [
        {
          text: i18n.t('alarm statistics'),
          href: '/dataCenter/alarm/statistics',
        },
        {
          text: i18n.t('alarm record'),
          href: '/dataCenter/alarm/record',
        },
        {
          text: i18n.t('alarm strategy'),
          href: '/dataCenter/alarm/strategy',
        },
        {
          text: i18n.t('custom alarm'),
          href: '/dataCenter/alarm/custom',
        },
      ],
    },
    {
      key: 'dataCenterLog',
      href: '/dataCenter/log',
      icon: 'fwlb',
      text: i18n.t('log analyze'),
      subMenu: [
        {
          text: i18n.t('log query'),
          href: '/dataCenter/log/query',
        },
        {
          text: i18n.t('analyze rule'),
          href: '/dataCenter/log/rule',
        },
      ],
    },
  ], MENU_SCOPE.dataCenter);
};
