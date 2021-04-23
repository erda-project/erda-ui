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
import { get, filter } from 'lodash';
import permStore from 'user/stores/permission';
import { goTo } from 'common/utils';
import { ApplicationOne, DashboardCar, HoldingHands, Stethoscope, Stretching, List, Config, DataAll } from '@icon-park/react';
import React from 'react';

export const getProjectMenu = (projectId: string, pathname: string) => {
  const projectPerm = permStore.getState(s => s.project);

  const menu = [
    {
      href: goTo.resolve.projectApps(), // `/workBench/projects/${projectId}/apps`,
      icon: <ApplicationOne />,
      text: i18n.t('project:applications'),
      show: projectPerm.appList.viewAppList.pass,
    },
    {
      href: goTo.resolve.projectAllIssue(), //`/workBench/projects/${projectId}/issues/all`,
      icon: <HoldingHands />,
      text: i18n.t('project:project collaboration'),
      show: projectPerm.backLog.viewBackLog.pass || projectPerm.iteration.read.pass || projectPerm.issue.viewIssue.pass || projectPerm.epic.read.pass,
      prefix: `${goTo.resolve.projectIssueRoot()}/`,
    },
    // { // TODO： 3.21临时去除

    //   text: i18n.t('pipeline'),
    //   icon: 'lsx',
    //   href: `/workBench/projects/${projectId}/pipelines`,
    //   show: projectPerm.pipeline.view.pass,
    // },
    {
      href: goTo.resolve.project(), //`/workBench/projects/${projectId}`,
      icon: <Stethoscope />,
      text: i18n.t('project:test'),
      show: projectPerm.testManage.viewTest.pass,
      subMenu: [
        {
          href: goTo.resolve.projectManualTestCase(), // `/workBench/projects/${projectId}/testCase/manual`,
          text: i18n.t('project:test case'),
          prefix: `${goTo.resolve.projectTestCaseRoot()}/`,
        },
        {
          href: goTo.resolve.projectDataSource(), //`/workBench/projects/${projectId}/data-bank/data-source`,
          text: i18n.t('project:data bank'),
          show: projectPerm.dataBank.dataSource.view.pass || projectPerm.dataBank.configData.view.pass,
          prefix: `${goTo.resolve.projectDataBankRoot()}/`,
        },
        {
          href: goTo.resolve.projectManualTestPlane(), // `/workBench/projects/${projectId}/testPlan/manual`,
          text: i18n.t('project:test plan'),
          prefix: `${goTo.resolve.projectTestPlaneRoot()}/`,
        },
        {
          href: goTo.resolve.projectManualTestEnv(), // `/workBench/projects/${projectId}/testEnv/manual`,
          text: i18n.t('project:parameter configuration'),
          prefix: `${goTo.resolve.projectTestEnvRoot()}/`,
        },
      ],
    },
    {
      href: goTo.resolve.projectDashboard(), // `/workBench/projects/${projectId}/dashboard`,
      icon: <DashboardCar />,
      text: i18n.t('statistical report'),
      show: projectPerm.dashboard.viewDashboard.pass,
    },
    {
      href: goTo.resolve.projectService(),
      icon: <Stretching />,
      text: i18n.t('addon service'),
      show: projectPerm.service.viewService.pass,
    },
    {
      text: i18n.t('project:resource summary'),
      icon: <DataAll />,
      href: goTo.resolve.projectResource(),
      show: projectPerm.resource.viewResource.pass,
    },
    {
      text: i18n.t('project:ticket list'),
      icon: <List />,
      href: goTo.resolve.projectTicket(),
      show: projectPerm.ticket.read.pass,
    },
    // {
    //   href: `/workBench/projects/${projectId}/config`,
    //   icon: 'unlock',
    //   text: '配置管理',
    // }
    {
      href: goTo.resolve.projectSetting(), //`/workBench/projects/${projectId}/setting`,
      icon: <Config />,
      text: `${i18n.t('project setting')}`,
      show: projectPerm.setting.viewSetting.pass,
    },
  ];

  const useableMenu = filter(menu, item => item.show);
  // let pathMatch = false;
  // useableMenu.forEach(m => {
  //   const { href: _href, isActive } = m;
  //   if (!pathMatch && (pathname.startsWith(_href) || (isActive && isActive(pathname)))) pathMatch = true;
  // });
  // const useableUrl = get(useableMenu, '[0].href');
  // if (!pathMatch && useableUrl) {
  //   goTo(useableUrl, { replace: true });
  // }
  return useableMenu;
};
