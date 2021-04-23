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
  dataCenter = 'dataCenter',
  workBench = 'workBench',
}
const hiddenWhenOnlyFDP = (item: IMenuItem) => (ONLY_FDP ? null : item);
const defaultFunc = (a: any) => a;

const { ONLY_FDP, ENABLE_MPAAS } = diceEnv || {};
const menuFilterMap = {
  appCenter: { // 应用中心
    workBench: hiddenWhenOnlyFDP,
    microService: hiddenWhenOnlyFDP,
    edge: hiddenWhenOnlyFDP,
    apiManage: hiddenWhenOnlyFDP,
    dataCenter: (item: IMenuItem) => {
      const name = ONLY_FDP ? i18n.t('Data Center') : i18n.t('DataCenter');
      return { ...item, name, breadcrumbName: name };
    },
  },
  orgCenter: { // 企业中心
    orgMarket: (item: IMenuItem) => {

      const publisherId = orgStore.getState(s => s.currentOrg.publisherId);
      const orgPublisherAuth = !!publisherId;
      return ENABLE_MPAAS && orgPublisherAuth ? item : null;
    },
    orgCertificate: (item: IMenuItem) => (ENABLE_MPAAS ? item : null),
  },
  dataCenter: { // 云管平台
    dataCenterOverview: (item: IMenuItem) => {
      const text = ONLY_FDP ? i18n.t('resource data') : i18n.t('cluster overview');
      return { ...item, text };
    },
    dataCenterResources: hiddenWhenOnlyFDP,
    dataCenterServices: hiddenWhenOnlyFDP,
    dataCenterDashboard: hiddenWhenOnlyFDP,
    dataCenterReport: hiddenWhenOnlyFDP,
    dataCenterLog: hiddenWhenOnlyFDP,
  },
  workBench: {
    workBenchPublisher: (item: IMenuItem) => {
      const publisherId = orgStore.getState(s => s.currentOrg.publisherId);
      const orgPublisherAuth = !!publisherId;
      return ENABLE_MPAAS && orgPublisherAuth ? item : null;
    },
  },
};

export const filterMenu = (menu: IMenuItem[], type: MENU_SCOPE) => {
  return compact(map(menu, item => {
    const func = get(menuFilterMap, `${type}.${item.key}`) || defaultFunc;
    const reItem = func(item);
    if (reItem && reItem.subMenu) {
      reItem.subMenu = compact(map(reItem.subMenu, subItem => {
        const subFunc = get(menuFilterMap, `${type}.${subItem.key}`) || defaultFunc;
        return subFunc(subItem);
      }));
    }
    return reItem;
  }));
};
