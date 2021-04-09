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

import { pages } from 'common/utils';
import i18n from 'i18n';
import { filterMenu, MENU_SCOPE } from './util';

export const appList: LAYOUT.IApp[] = filterMenu([
  {
    key: 'workBench',
    name: i18n.t('WorkBench'),
    breadcrumbName: i18n.t('WorkBench'),
    path: (params: any, routes: any[]): string => { // in order to show xxx list when click 工作台 in none apps pages
      let path;
      routes.forEach((route) => {
        if (route.path === 'service') {
          path = `/workBench/${route.path}`;
        }
      });
      if (path) {
        return path;
      }
      const { projectId, appId } = params;
      path = pages.workBenchRoot;
      if (!appId && (projectId || routes.some(route => route.path === 'projects'))) {
        path = '/workBench/projects';
      }
      return path;
    },
    href: pages.workBenchRoot,
  },
  {
    key: 'microService',
    name: i18n.t('Microservice'),
    breadcrumbName: i18n.t('Microservice'),
    href: pages.microServiceRoot,
  },
  {
    key: 'apiManage',
    name: i18n.t('default:API management platform'),
    breadcrumbName: i18n.t('default:API management platform'),
    href: pages.apiManageRoot,
  },
  {
    key: 'diceFdp',
    name: i18n.t('Fast data'),
    breadcrumbName: i18n.t('Fast data'),
    href: pages.fdpIndex,
  },
  {
    key: 'dataCenter',
    name: i18n.t('DataCenter'),
    breadcrumbName: i18n.t('DataCenter'),
    href: pages.dataCenterRoot,
  },
  {
    key: 'edge',
    name: i18n.t('edge:edge center'),
    breadcrumbName: i18n.t('edge:edge center'),
    href: pages.edgeApp,
  },
  {
    key: 'orgCenter',
    name: i18n.t('orgCenter'),
    breadcrumbName: i18n.t('orgCenter'),
    href: pages.orgCenterRoot,
  },
], MENU_SCOPE.appCenter);
