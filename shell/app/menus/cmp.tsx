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
  Log as IconLog,
  ListTwo as IconListTwo,
  DataDisplay as IconDataDisplay,
  DataAll as IconDataAll,
  DashboardCar as IconDashboardCar,
  DataFile as IconDataFile,
  DatabaseAlert as IconDatabaseAlert,
} from '@icon-park/react';
import React from 'react';

export const getCmpMenu = () => {
  return filterMenu(
    [
      {
        key: 'cmpOverview',
        href: goTo.resolve.cmpRoot(),
        icon: <IconDataDisplay />,
        text: i18n.t('cluster overview'),
        subtitle: i18n.t('Overview'),
      },
      {
        key: 'cmpResources',
        href: goTo.resolve.cmpClusters(), // '/cmp/clusters',
        icon: <IconDataAll />,
        text: i18n.t('resource management'),
        subtitle: i18n.t('Resource'),
        subMenu: [
          {
            key: 'cmpCluster',
            href: goTo.resolve.cmpClusters(), // '/cmp/clusters',
            text: i18n.t('clusters'),
          },
          {
            key: 'cmpCloudSource',
            href: goTo.resolve.cloudSource(), // '/cmp/cloudSource',
            text: i18n.t('cloud source'),
          },
          {
            key: 'cmpResources',
            href: goTo.resolve.cmpDomain(), // '/cmp/domain',
            text: i18n.t('runtime:manage domain'),
          },
        ],
      },
      {
        key: 'cmpServices',
        href: goTo.resolve.cmpServices(), // '/cmp/services',
        icon: <IconListTwo />,
        text: i18n.t('services&tasks'),
        subtitle: i18n.t('Service'),
        subMenu: [
          {
            href: goTo.resolve.cmpServices(), // '/cmp/services',
            text: i18n.t('services'),
          },
          {
            href: goTo.resolve.cmpAddon(), // '/cmp/addon',
            text: i18n.t('addon service'),
          },
          {
            href: goTo.resolve.cmpJobs(), // '/cmp/jobs',
            text: i18n.t('job catalogue'),
          },
        ],
      },
      {
        key: 'cmpDashboard',
        href: goTo.resolve.orgCustomDashboard(), // '/cmp/customDashboard',
        icon: <IconDashboardCar />,
        text: i18n.t('org:O & M dashboard'),
        subtitle: i18n.t('Dashboard'),
      },
      {
        key: 'cmpReport',
        href: goTo.resolve.cmpReport(), // '/cmp/report',
        icon: <IconDataFile />,
        text: i18n.t('O & M report'),
        subtitle: i18n.t('Report'),
      },
      {
        key: 'cmpAlarm',
        href: goTo.resolve.cmpAlarm(), // '/cmp/alarm',
        icon: <IconDatabaseAlert />,
        text: i18n.t('O & M alarm'),
        subtitle: i18n.t('Alarm'),
        subMenu: [
          {
            text: i18n.t('alarm statistics'),
            href: goTo.resolve.cmpAlarmStatistics(), // '/cmp/alarm/statistics',
          },
          {
            text: i18n.t('alarm record'),
            href: goTo.resolve.cmpAlarmRecord(), // '/cmp/alarm/record',
          },
          {
            text: i18n.t('alarm strategy'),
            href: goTo.resolve.cmpAlarmStrategy(), // '/cmp/alarm/strategy',
          },
          {
            text: i18n.t('custom alarm'),
            href: goTo.resolve.cmpAlarmCustom(), // '/cmp/alarm/custom',
          },
        ],
      },
      // {
      //   key: 'cmpLog',
      //   href: goTo.resolve.cmpLog(), // '/cmp/log',
      //   icon: <IconLog />,
      //   text: i18n.t('log analysis'),
      //   subMenu: [
      //     {
      //       text: i18n.t('log query'),
      //       href: goTo.resolve.cmpLogQuery(), // '/cmp/log/query',
      //     },
      //     {
      //       text: i18n.t('analysis rule'),
      //       href: goTo.resolve.cmpLogRule(), // '/cmp/log/rule',
      //     },
      //   ],
      // },
    ],
    MENU_SCOPE.cmp,
  );
};
