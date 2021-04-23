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
  Log,
  ListTwo,
  DataDisplay,
  DataAll,
  DashboardCar,
  DataFile,
  DatabaseAlert,
} from '@icon-park/react';
import React from 'react';

export const getDataCenterMenu = () => {
  return filterMenu([
    {
      key: 'dataCenterOverview',
      href: goTo.resolve.dataCenterRoot(),
      icon: <DataDisplay />,
      text: i18n.t('cluster overview'),
    },
    {
      key: 'dataCenterResources',
      href: goTo.resolve.dataCenterClusters(), // '/dataCenter/clusters',
      icon: <DataAll />,
      text: i18n.t('resources'),
      subMenu: [
        {
          key: 'dataCenterCluster',
          href: goTo.resolve.dataCenterClusters(), // '/dataCenter/clusters',
          text: i18n.t('clusters'),
        },
        {
          key: 'dataCenterCloudSource',
          href: goTo.resolve.cloudSource(), // '/dataCenter/cloudSource',
          text: i18n.t('cloud source'),
        },
        {
          key: 'dataCenterResources',
          href: goTo.resolve.dataCenterDomain(), //'/dataCenter/domain',
          text: i18n.t('runtime:manage domain'),
        },
      ],
    },
    {
      key: 'dataCenterServices',
      href: goTo.resolve.dataCenterServices(), // '/dataCenter/services',
      icon: <ListTwo />,
      text: i18n.t('services & jobs'),
      subMenu: [
        {
          href: goTo.resolve.dataCenterServices(), //'/dataCenter/services',
          text: i18n.t('services'),
        },
        {
          href: goTo.resolve.dataCenterAddon(), // '/dataCenter/addon',
          text: i18n.t('addon service'),
        },
        {
          href: goTo.resolve.dataCenterJobs(), //'/dataCenter/jobs',
          text: i18n.t('job catalogue'),
        },
      ],
    },
    {
      key: 'dataCenterDashboard',
      href: goTo.resolve.orgCustomDashboard(), // '/dataCenter/customDashboard',
      icon: <DashboardCar />,
      text: i18n.t('org:O & M dashboard'),
    },
    {
      key: 'dataCenterReport',
      href: goTo.resolve.dataCenterReport(), // '/dataCenter/report',
      icon: <DataFile />,
      text: i18n.t('O & M report'),
    },
    {
      key: 'dataCenterAlarm',
      href: goTo.resolve.dataCenterAlarm(), // '/dataCenter/alarm',
      icon: <DatabaseAlert />,
      text: i18n.t('O & M alarm'),
      subMenu: [
        {
          text: i18n.t('alarm statistics'),
          href: goTo.resolve.dataCenterAlarmStatistics(), // '/dataCenter/alarm/statistics',
        },
        {
          text: i18n.t('alarm record'),
          href: goTo.resolve.dataCenterAlarmRecord(), //'/dataCenter/alarm/record',
        },
        {
          text: i18n.t('alarm strategy'),
          href: goTo.resolve.dataCenterAlarmStrategy(), // '/dataCenter/alarm/strategy',
        },
        {
          text: i18n.t('custom alarm'),
          href: goTo.resolve.dataCenterAlarmCustom(), // '/dataCenter/alarm/custom',
        },
      ],
    },
    {
      key: 'dataCenterLog',
      href: goTo.resolve.dataCenterLog(), //'/dataCenter/log',
      icon: <Log />,
      text: i18n.t('log analyze'),
      subMenu: [
        {
          text: i18n.t('log query'),
          href: goTo.resolve.dataCenterLogQuery(), //'/dataCenter/log/query',
        },
        {
          text: i18n.t('analyze rule'),
          href: goTo.resolve.dataCenterLogRule(), // '/dataCenter/log/rule',
        },
      ],
    },
  ], MENU_SCOPE.dataCenter);
};
