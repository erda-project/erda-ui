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

import { get } from 'lodash';
import { goTo } from 'common/utils';
import i18n from 'i18n';
import { filterMenu, MENU_SCOPE } from './util';

const { indexUrl, name } = (process.env.dataEngineerInfo || {}) as unknown as { indexUrl?: string; name?: string };

export const appList: () => LAYOUT.IApp[] = () =>
  filterMenu(
    [
      {
        key: 'dop',
        name: i18n.t('dop'),
        breadcrumbName: i18n.t('dop'),
        path: (params: any, routes: any[]): string => {
          // in order to show xxx list when click 工作台 in none apps pages
          let path;
          const { orgName, projectId, appId } = params;
          routes.forEach((route) => {
            if (route.path === 'service') {
              path = `/${orgName}/dop/${route.path}`;
            }
          });
          if (path) {
            return path;
          }
          path = goTo.resolve.dopRoot();
          if (!appId && (projectId || routes.some((route) => route.path === 'projects'))) {
            path = `/${orgName}/dop/projects`;
          }
          return path;
        },
        href: goTo.resolve.dopRoot(),
      },
      {
        key: 'msp',
        name: i18n.t('msp'),
        breadcrumbName: i18n.t('msp'),
        href: goTo.resolve.mspRoot(),
      },
      {
        key: 'apiManage',
        name: i18n.t('default:API management platform'),
        breadcrumbName: i18n.t('default:API management platform'),
        href: goTo.resolve.apiManageRoot(),
      },
      {
        key: `${name}`,
        name: i18n.t('Fast data'),
        breadcrumbName: i18n.t('Fast data'),
        href: indexUrl?.replace('{orgName}', get(location.pathname.split('/'), '[1]') || '-'),
      },
      {
        key: 'cmp',
        name: i18n.t('cloud management'),
        breadcrumbName: i18n.t('cloud management'),
        href: goTo.resolve.cmpRoot(),
      },
      {
        key: 'edge',
        name: i18n.t('edge:edge computing'),
        breadcrumbName: i18n.t('edge:edge computing'),
        href: goTo.resolve.edgeApp(),
      },
      {
        key: 'orgCenter',
        name: i18n.t('orgCenter'),
        breadcrumbName: i18n.t('orgCenter'),
        href: goTo.resolve.orgCenterRoot(),
      },
    ],
    MENU_SCOPE.appCenter,
  );
