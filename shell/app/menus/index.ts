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


import { getOrgCenterMenu } from './orgCenter';
import { getDataCenterMenu } from './dataCenter';
import { getWorkBenchMenu } from './workBench';
import { getMicroServiceMenu } from './microService';
import { getProjectMenu } from './project';
import { getAppMenu } from './application';
import { getEdgeMenu } from './edge';
import i18n from 'app/i18n';
import { produce } from 'immer';
import { filter, map } from 'lodash';
import { appList } from './appCenter';

export {
  getProjectMenu,
  getAppMenu,
  getOrgCenterMenu,
  getDataCenterMenu,
  getWorkBenchMenu,
  getMicroServiceMenu,
  getEdgeMenu,
};

export const appCenterAppList = appList;

export const getSubSiderInfoMap = () => {
  const menus = {
    orgCenter: {
      menu: getOrgCenterMenu(),
      detail: {
        displayName: i18n.t('orgCenter'),
      },
    },
    dataCenter: {
      menu: getDataCenterMenu(),
      detail: {
        displayName: i18n.t('DataCenter'),
      },
    },
    workBench: {
      menu: getWorkBenchMenu(),
      detail: {
        displayName: i18n.t('workBench'),
      },
    },
    microService: {
      menu: getMicroServiceMenu(),
      detail: {
        displayName: i18n.t('Microservice'),
      },
    },
    edge: {
      menu: getEdgeMenu(),
      detail: {
        displayName: i18n.t('edge:edge center'),
      },
    },
    // sysAdmin: {
    //   menu: getSysAdminMenu(),
    //   detail: {
    //     displayName: i18n.t('admin'),
    //   },
    // },
  };

  const filtered = produce(menus, draft => {
    map(draft, (obj) => {
      // eslint-disable-next-line no-param-reassign
      obj.menu = filter(obj.menu, (m: any) => {
        if (m.subMenu) {
          // eslint-disable-next-line no-param-reassign
          m.subMenu = m.subMenu.filter((s: any) => s.show !== false);
        }
        return m.show !== false;
      });
    });
  });
  return filtered;
};
