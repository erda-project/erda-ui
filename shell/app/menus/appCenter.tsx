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

import { goTo, insertWhen } from 'common/utils';
import i18n from 'i18n';
import { filterMenu, MENU_SCOPE } from './util';
import dovopsIcon from 'app/images/icons/devops.png';
import cmpIcon from 'app/images/icons/cmp.png';
import fdpIcon from 'app/images/icons/fdp.png';
import galleryIcon from 'app/images/icons/gallery.png';
import orgCenterIcon from 'app/images/icons/orgCenter.png';
// import mspIcon from 'app/images/icons/msp.png';
import ecpIcon from 'app/images/icons/ecp.png';

export const appList: () => LAYOUT.IApp[] = () =>
  filterMenu(
    [
      {
        key: 'dop',
        icon: 'DevOps-entry',
        iconImg: dovopsIcon,
        name: i18n.t('DevOps Platform'),
        breadcrumbName: i18n.t('DevOps Platform'),
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
      // {
      //   key: 'msp',
      //   icon: 'MSP-entry',
      //   iconImg: mspIcon,
      //   name: i18n.t('Microservice Platform'),
      //   breadcrumbName: i18n.t('Microservice Platform'),
      //   href: goTo.resolve.mspRootOverview(),
      // },
      {
        key: 'cmp',
        icon: 'CMP-entry',
        iconImg: cmpIcon,
        name: i18n.t('Cloud Management Platform'),
        breadcrumbName: i18n.t('Cloud Management Platform'),
        href: goTo.resolve.cmpRoot(),
      },
      ...insertWhen(!process.env.FOR_COMMUNITY, [
        {
          key: 'fdp',
          icon: 'FDP-entry',
          iconImg: fdpIcon,
          name: i18n.t('Fast Data Platform'),
          breadcrumbName: i18n.t('Fast Data Platform'),
          href: goTo.resolve.dataAppEntry(),
        },
      ]),
      {
        key: 'ecp',
        icon: 'ECP-entry',
        iconImg: ecpIcon,
        name: i18n.t('ecp:Edge computing'),
        breadcrumbName: i18n.t('ecp:Edge computing'),
        href: goTo.resolve.ecpApp(),
      },
      {
        key: 'orgCenter',
        icon: 'control-entry',
        iconImg: orgCenterIcon,
        name: i18n.t('Admin Center'),
        breadcrumbName: i18n.t('Admin Center'),
        href: goTo.resolve.orgCenterRoot(),
      },
      {
        key: 'gallery',
        icon: 'market-entry',
        iconImg: galleryIcon,
        name: 'Gallery',
        breadcrumbName: 'Gallery',
        href: goTo.resolve.galleryRoot(),
      },
    ],
    MENU_SCOPE.appCenter,
  );
