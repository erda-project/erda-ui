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
      show: projectPerm.appList.viewAppList.pass,
    },
    {
      href: goTo.resolve.projectAllIssue(), // `/dop/projects/${projectId}/issues/all`,
      icon: <CustomIcon type="xiangmuxietong" />,
      text: i18n.t('project:issues'),
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
      text: i18n.t('project:test'),
      show: projectPerm.testManage.viewTest.pass,
      subMenu: [
        {
          href: goTo.resolve.projectTestCodeCoverage(),
          text: i18n.t('project:code coverage statistics'),
        },
        {
          href: goTo.resolve.projectManualTestCase(), // `/dop/projects/${projectId}/testCase/manual`,
          text: i18n.t('project:test case'),
          prefix: `${goTo.resolve.projectTestCaseRoot()}/`,
        },
        {
          href: goTo.resolve.projectDataSource(), // `/dop/projects/${projectId}/data-bank/data-source`,
          text: i18n.t('project:data bank'),
          show: projectPerm.dataBank.dataSource.view.pass || projectPerm.dataBank.configData.view.pass,
          prefix: `${goTo.resolve.projectDataBankRoot()}/`,
        },
        {
          href: goTo.resolve.projectManualTestPlane(), // `/dop/projects/${projectId}/testPlan/manual`,
          text: i18n.t('project:test plan'),
          prefix: `${goTo.resolve.projectTestPlaneRoot()}/`,
        },
        {
          href: goTo.resolve.projectManualTestEnv(), // `/dop/projects/${projectId}/testEnv/manual`,
          text: i18n.t('project:parameter configuration'),
          prefix: `${goTo.resolve.projectTestEnvRoot()}/`,
        },
      ],
    },
    {
      href: goTo.resolve.projectService(),
      icon: <CustomIcon type="kuozhanfuwu" />,
      text: i18n.t('project:addon'),
      show: projectPerm.service.viewService.pass,
    },
    {
      text: i18n.t('project:resource summary'),
      icon: <IconDataAll />,
      href: goTo.resolve.projectResource(),
      show: projectPerm.resource.viewResource.pass,
    },
    {
      text: i18n.t('project:tickets'),
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
