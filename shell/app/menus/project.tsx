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
import { filter } from 'lodash';
import permStore from 'user/stores/permission';
import { goTo } from 'common/utils';
import {
  ApplicationOne as IconApplicationOne,
  DashboardCar as IconDashboardCar,
  List as IconList,
  Config as IconConfig,
  DataAll as IconDataAll,
} from '@icon-park/react';
import React from 'react';
import { Icon as CustomIcon } from 'common';

export const getProjectMenu = (projectId: string, pathname: string) => {
  const projectPerm = permStore.getState((s) => s.project);

  const menu = [
    {
      href: goTo.resolve.projectApps(), // `/dop/projects/${projectId}/apps`,
      icon: <IconApplicationOne />,
      text: i18n.t('project:applications'),
      subtitle: i18n.t('App'),
      show: projectPerm.appList.viewAppList.pass,
    },
    {
      href: goTo.resolve.projectAllIssue(), // `/dop/projects/${projectId}/issues/all`,
      icon: <CustomIcon type="xiangmuxietong" />,
      text: i18n.t('project:issues'),
      subtitle: i18n.t('Issues'),
      show:
        projectPerm.backLog.viewBackLog.pass ||
        projectPerm.iteration.read.pass ||
        projectPerm.issue.viewIssue.pass ||
        projectPerm.epic.read.pass,
      prefix: `${goTo.resolve.projectIssueRoot()}/`,
    },
    // { // TODO： 3.21临时去除

    //   text: i18n.t('pipeline'),
    //   icon: 'lsx',
    //   href: `/dop/projects/${projectId}/pipelines`,
    //   show: projectPerm.pipeline.view.pass,
    // },
    {
      href: goTo.resolve.project(), // `/dop/projects/${projectId}`,
      icon: <CustomIcon type="ceshiguanli" />,
      text: i18n.t('test'),
      subtitle: i18n.t('Test'),
      show: projectPerm.testManage.viewTest.pass,
      subMenu: [
        {
          href: goTo.resolve.projectTestDashboard(),
          text: i18n.t('project:statistics'),
          prefix: goTo.resolve.projectTestStatisticsRoot(),
        },
        {
          href: goTo.resolve.projectManualTestCase(),
          text: i18n.t('project:manual test'),
          prefix: `${goTo.resolve.projectManualTestRoot()}/`,
        },
        {
          href: goTo.resolve.projectAutoTestCase(),
          text: i18n.t('project:auto test'),
          prefix: `${goTo.resolve.projectAutoTestRoot()}/`,
        },
        {
          href: goTo.resolve.projectTestReport(),
          text: i18n.t('project:test report'),
          prefix: `${goTo.resolve.projectTestReport()}`,
        },
      ],
    },
    {
      href: goTo.resolve.projectService(),
      icon: <CustomIcon type="kuozhanfuwu" />,
      text: i18n.t('project:addon'),
      subtitle: 'Addon',
      show: projectPerm.service.viewService.pass,
    },
    {
      text: i18n.t('project:resource summary'),
      subtitle: i18n.t('Resource'),
      icon: <IconDataAll />,
      href: goTo.resolve.projectResource(),
      show: projectPerm.resource.viewResource.pass,
    },
    {
      text: i18n.t('project:tickets'),
      subtitle: i18n.t('Tickets'),
      icon: <IconList />,
      href: goTo.resolve.projectTicket(),
      show: projectPerm.ticket.read.pass,
    },
    // {
    //   href: `/dop/projects/${projectId}/config`,
    //   icon: 'unlock',
    //   text: '配置管理',
    // }
    {
      href: goTo.resolve.projectSetting(), // `/dop/projects/${projectId}/setting`,
      icon: <IconConfig />,
      text: `${i18n.t('project setting')}`,
      subtitle: i18n.t('Setting'),
      show: projectPerm.setting.viewSetting.pass,
    },
  ];

  const useableMenu = filter(menu, (item) => item.show);
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
