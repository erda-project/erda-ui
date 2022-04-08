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
import { goTo, insertWhen } from 'common/utils';
import { filterMenu, MENU_SCOPE } from './util';
import React from 'react';
import ErdaIcon from 'common/components/erda-icon';
import { EMPTY_CLUSTER } from 'cmp/pages/cluster-manage/config';

export const getCmpMenu = (chosenCluster = EMPTY_CLUSTER) => {
  return filterMenu(
    [
      {
        key: 'cmpOverview',
        href: goTo.resolve.cmpRoot(),
        icon: <ErdaIcon type="jiqunzonglan" />,
        text: i18n.t('Cluster Overview'),
        subtitle: i18n.t('Overview'),
      },
      {
        key: 'cmpResources',
        icon: <ErdaIcon type="jiqunziyuan" />,
        href: goTo.resolve.cmpClusters(),
        text: i18n.t('Cluster Resource'),
        subtitle: i18n.t('Resource'),
        subMenu: [
          {
            key: 'cmpCluster',
            href: goTo.resolve.cmpClusters(),
            text: i18n.t('clusters'),
          },
          {
            key: 'cmpResourceRank',
            href: goTo.resolve.cmpResourceProjectRank(),
            text: i18n.t('Resource Ranking'),
            prefix: `${goTo.resolve.cmpResourceRank()}/`,
          },
          {
            key: 'cmpCloudSource',
            href: goTo.resolve.cloudSource(),
            text: i18n.t('Cloud Service'),
          },
        ],
      },
      {
        key: 'containerResource',
        icon: <ErdaIcon type="rongqiziyuan" />,
        href: goTo.resolve.cmpClustersContainer({ clusterName: chosenCluster }),
        text: i18n.t('Container Resource'),
        subtitle: i18n.t('Container'),
        subMenu: [
          {
            key: 'clusterNodes',
            href: goTo.resolve.cmpClustersNodes({ clusterName: chosenCluster }),
            text: i18n.t('Node'),
          },
          {
            key: 'clusterPod',
            href: goTo.resolve.cmpClustersPods({ clusterName: chosenCluster }),
            text: 'Pods',
          },
          {
            key: 'clusterWorkload',
            href: goTo.resolve.cmpClustersWorkload({ clusterName: chosenCluster }),
            text: i18n.t('cmp:Workload'),
          },
          {
            key: 'clusterNodes',
            href: goTo.resolve.cmpClustersEventLog({ clusterName: chosenCluster }),
            text: i18n.t('cmp:Event Log'),
          },
        ],
      },
      {
        key: 'cmpServices',
        icon: <ErdaIcon type="yingyongziyuan" />,
        href: goTo.resolve.cmpDomain(),
        text: i18n.t('App Resource'),
        subtitle: i18n.t('App'),
        subMenu: [
          {
            key: 'cmpResources',
            href: goTo.resolve.cmpDomain(), // '/cmp/domain',
            text: i18n.t('domain'),
          },
          {
            href: goTo.resolve.cmpServices(), // '/cmp/services',
            text: i18n.t('Service'),
          },
          {
            href: goTo.resolve.cmpJobs(), // '/cmp/jobs',
            text: i18n.t('task'),
          },
          ...insertWhen(!process.env.FOR_COMMUNITY, [
            {
              href: goTo.resolve.cmpAddon(), // '/cmp/addon',
              text: i18n.t('Addon'),
            },
          ]),
        ],
      },
      {
        key: 'cmpReport',
        href: goTo.resolve.cmpReport(), // '/cmp/report',
        icon: <ErdaIcon type="yunweibaogao" />,
        text: i18n.t('O&M Report'),
        subtitle: i18n.t('Report'),
      },
      {
        key: 'cmpAlarm',
        href: goTo.resolve.cmpAlarm(), // '/cmp/alarm',
        icon: <ErdaIcon type="gaojing" />,
        text: i18n.t('O&M Alert'),
        subtitle: i18n.t('Alarm'),
        subMenu: [
          {
            text: i18n.t('Overview-alarm'),
            href: goTo.resolve.cmpAlarmOverview(), // '/cmp/alarm/overview',
          },
          {
            text: i18n.t('History'),
            href: goTo.resolve.cmpAlarmRecord(), // '/cmp/alarm/record',
          },
          {
            text: i18n.t('Configuration'),
            href: goTo.resolve.cmpAlarmConfig(), // '/cmp/alarm/strategy',
          },
        ],
      },
      {
        key: 'cmpDashboard',
        href: goTo.resolve.orgCustomDashboard(), // '/cmp/customDashboard',
        icon: <ErdaIcon type="zidingyi" />,
        text: i18n.t('Custom Dashboard'),
        subtitle: i18n.t('Dashboard'),
      },
      // {
      //   key: 'cmpLog',
      //   href: goTo.resolve.cmpLog(), // '/cmp/log',
      //   icon: <IconLog />,
      //   text: i18n.t('log analysis'),
      //   subMenu: [
      //     {
      //       text: i18n.t('Log Query'),
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
