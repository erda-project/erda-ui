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
import React from 'react';
import { Icon as CustomIcon, ErdaIcon } from 'common';

export const getProjectMenu = (projectId: string, pathname: string) => {
  const projectPerm = permStore.getState((s) => s.project);

  const menu = [
    {
      href: goTo.resolve.projectAllIssue(), // `/dop/projects/${projectId}/issues/all`,
      icon: <CustomIcon type="xiangmuxietong" />,
      text: i18n.t('dop:Projects'),
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
      href: goTo.resolve.projectTestStatisticsRoot(), // `/dop/projects/${projectId}`,
      icon: <CustomIcon type="ceshiguanli" />,
      text: i18n.t('Test Management'),
      subtitle: i18n.t('Test'),
      show: projectPerm.testManage.viewTest.pass,
      subMenu: [
        {
          href: goTo.resolve.projectTestDashboard(),
          text: i18n.t('dop:statistics'),
          prefix: goTo.resolve.projectTestStatisticsRoot(),
        },
        {
          href: goTo.resolve.projectManualTestCase(),
          text: i18n.t('dop:manual test'),
          prefix: `${goTo.resolve.projectManualTestRoot()}/`,
        },
        {
          href: goTo.resolve.projectAutoTestCase(),
          text: i18n.t('dop:auto test'),
          prefix: `${goTo.resolve.projectAutoTestRoot()}/`,
        },
        {
          href: goTo.resolve.projectTestReport(),
          text: i18n.t('dop:test report'),
          prefix: `${goTo.resolve.projectTestReport()}`,
        },
      ],
    },
    {
      href: goTo.resolve.projectApps(), // `/dop/projects/${projectId}/apps`,
      icon: <ErdaIcon type="application-one" className="mt-3.5 mr-1" color="currentColor" />,
      text: i18n.t('dop:Applications'),
      subtitle: i18n.t('App'),
      show: projectPerm.appList.viewAppList.pass,
    },
    {
      href: goTo.resolve.project(), // `/dop/projects/${projectId}/apps`,
      icon: <ErdaIcon type="dashboard-car" className="mt-3.5 mr-1" color="currentColor" />,
      text: i18n.t('dop:O & M'),
      subtitle: i18n.t('dop:operator'),
      show: projectPerm.service.viewService.pass || projectPerm.resource.viewResource.pass,
      subMenu: [
        {
          href: goTo.resolve.projectService(),
          icon: <CustomIcon type="kuozhanfuwu" />,
          text: i18n.t('dop:Addon'),
          subtitle: 'Addon',
          show: projectPerm.service.viewService.pass,
        },
        {
          href: goTo.resolve.projectResource(),
          text: i18n.t('Resource summary'),
          icon: <ErdaIcon type="data-all" color="currentColor" />,
          subtitle: i18n.t('Resource'),
          show: projectPerm.resource.viewResource.pass,
        },
      ],
    },
    {
      text: i18n.t('dop:tickets'),
      subtitle: i18n.t('Tickets'),
      icon: <ErdaIcon type="list1" className="mt-3.5 mr-1" color="currentColor" />,
      href: goTo.resolve.projectTicket(),
      show: projectPerm.ticket.read.pass,
    },
    {
      href: goTo.resolve.projectSetting(), // `/dop/projects/${projectId}/setting`,
      icon: <ErdaIcon type="config1" className="mt-3.5 mr-1" color="currentColor" />,
      text: `${i18n.t('{key} Settings', { key: i18n.t('project') })}`,
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
