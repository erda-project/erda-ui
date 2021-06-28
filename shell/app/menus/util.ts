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

import { map, compact, get } from 'lodash';
import i18n from 'i18n';
import diceEnv from 'dice-env';
import userStore from 'app/user/stores';
import orgStore from 'app/org-home/stores/org';

interface IMenuItem {
  [pro: string]: any;
  key?: string;
}

export enum MENU_SCOPE {
  appCenter = 'appCenter',
  orgCenter = 'orgCenter',
  cmp = 'cmp',
  dop = 'dop',
}
const hiddenWhenOnlyFDP = (item: IMenuItem) => (ONLY_FDP ? null : item);
const defaultFunc = (a: any) => a;

const { ONLY_FDP } = diceEnv || {};
const menuFilterMap = {
  appCenter: {
    // 应用中心
    dop: hiddenWhenOnlyFDP,
    msp: hiddenWhenOnlyFDP,
    edge: hiddenWhenOnlyFDP,
    apiManage: hiddenWhenOnlyFDP,
    cmp: (item: IMenuItem) => {
      const name = ONLY_FDP ? i18n.t('Data Center') : i18n.t('cloud management');
      return { ...item, name, breadcrumbName: name };
    },
  },
  orgCenter: {
    // 企业中心
    orgMarket: (item: IMenuItem) => {
      const publisherId = orgStore.getState((s) => s.currentOrg.publisherId);
      return !publisherId ? null : item;
    },
    orgCertificate: (item: IMenuItem) => {
      const publisherId = orgStore.getState((s) => s.currentOrg.publisherId);
      return !publisherId ? null : item;
    },
  },
  cmp: {
    // 云管平台
    cmpOverview: (item: IMenuItem) => {
      const text = ONLY_FDP ? i18n.t('resource data') : i18n.t('cluster overview');
      return { ...item, text };
    },
    cmpResources: hiddenWhenOnlyFDP,
    cmpServices: hiddenWhenOnlyFDP,
    cmpDashboard: hiddenWhenOnlyFDP,
    cmpReport: hiddenWhenOnlyFDP,
    cmpLog: hiddenWhenOnlyFDP,
  },
  dop: {
    dopPublisher: (item: IMenuItem) => {
      const publisherId = orgStore.getState((s) => s.currentOrg.publisherId);
      return !publisherId ? null : item;
    },
  },
};

export const filterMenu = (menu: IMenuItem[], type: MENU_SCOPE) => {
  return compact(
    map(menu, (item) => {
      const func = get(menuFilterMap, `${type}.${item.key}`) || defaultFunc;
      const reItem = func(item);
      if (reItem && reItem.subMenu) {
        reItem.subMenu = compact(
          map(reItem.subMenu, (subItem) => {
            const subFunc = get(menuFilterMap, `${type}.${subItem.key}`) || defaultFunc;
            return subFunc(subItem);
          }),
        );
      }
      return reItem;
    }),
  );
};
