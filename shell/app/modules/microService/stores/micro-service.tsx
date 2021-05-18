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

import { createStore } from 'app/cube';
import * as microService from 'microService/services';
import { envMap, getMSFrontPathByKey, MSIconMap } from 'microService/config';
import { isEmpty, filter, get } from 'lodash';
import layoutStore from 'layout/stores/layout';
import { goTo, qs } from 'common/utils';
import { getCurrentLocale } from 'i18n';
import routeInfoStore from 'common/stores/route';
import { setGlobal } from 'app/global-space';
import wfwzl_svg from 'app/images/wfwzl.svg';
import { FULL_DOC_DOMAIN } from 'common/constants';
import React from 'react';

interface IState {
  microServiceProjectList: MS_INDEX.IMicroServiceProject[];
  microServiceMenu: MS_INDEX.Menu[];
  msMenuMap: MS_INDEX.MenuMap;
  clusterName: string;
  clusterType: string;
  DICE_CLUSTER_TYPE: string;
  isK8S: boolean;
}
const currentLocale = getCurrentLocale();

const generateMSMenu = (menuData: MS_INDEX.IMicroServiceMenu[], params: Record<string, any>, query:Record<string, any>) => {
  let queryStr = '';
  if (!isEmpty(query)) {
    queryStr = `?${qs.stringify(query)}`;
  }

  return menuData.filter(m => m.exists).map((menu) => {
    const { key, cnName, enName, children } = menu;
    const href = getMSFrontPathByKey(key, { ...menu.params, ...params } as any);

    const IconComp = MSIconMap[key];
    const siderMenu = {
      key,
      icon: IconComp  ? <IconComp /> : 'zujian',
      text: currentLocale.key === 'zh' ? cnName : enName,
      href: `${href}${queryStr}`,
      prefix: `${href}`,
      subMenu: [] as any,
    };
    if (children.length) {
      siderMenu.subMenu = children.filter(m => m.exists).map((child) => {
        const childHref = getMSFrontPathByKey(child.key, { ...child.params, ...params } as any);
        return {
          key: child.key,
          text: currentLocale.key === 'zh' ? child.cnName : child.enName,
          jumpOut: !!child.href,
          href: child.href ? `${FULL_DOC_DOMAIN}/${child.href}` : `${childHref}${queryStr}`,
          prefix: `${childHref}`,
        };
      });
    }
    return siderMenu;
  });
};

const initState: IState = {
  microServiceProjectList: [],
  microServiceMenu: [],
  msMenuMap: {},
  clusterName: '',
  clusterType: '',
  DICE_CLUSTER_TYPE: '',
  isK8S: true,
};


const microServiceStore = createStore({
  name: 'microService',
  state: initState,
  subscriptions({ listenRoute }: IStoreSubs) {
    listenRoute(({ isEntering, isLeaving }:IRouteInfo) => {
      if (isEntering('microServiceDetail')) {
        microServiceStore.effects.getMicroServiceMenuList().then((msMenu:MS_INDEX.IMicroServiceMenu[]) => {
          if (msMenu.length) {
            const DICE_CLUSTER_NAME = msMenu[0].clusterName;
            const DICE_CLUSTER_TYPE = msMenu[0].clusterType || '';
            const isEdas = DICE_CLUSTER_TYPE.includes('edasv2');
            const isK8S = DICE_CLUSTER_TYPE === 'kubernetes';
            const clusterType = isEdas ? 'EDAS' : 'TERMINUS';
            setGlobal('service-provider', clusterType);
            microServiceStore.reducers.updateClusterInfo({ clusterType, isK8S, clusterName: DICE_CLUSTER_NAME, DICE_CLUSTER_TYPE });
          }
        });
      }
      if (isLeaving('microServiceDetail')) {
        setGlobal('service-provider', undefined);
        microServiceStore.reducers.updateClusterInfo({ clusterType: undefined, isK8S: undefined, clusterName: undefined, DICE_CLUSTER_TYPE: undefined });
        microServiceStore.reducers.clearMenuInfo();
      }
    });
  },
  effects: {
    async getMicroServiceProjectList({ call, update }) {
      const microServiceProjectList = await call(microService.getMicroServiceProjectList);
      await update({ microServiceProjectList });
    },
    async getMicroServiceMenuList({ call, select, update }) {
      const [params, routes, query] = routeInfoStore.getState(s => [s.params, s.routes, s.query]);
      let microServiceMenu = await select(s => s.microServiceMenu);
      const { env, projectId, tenantGroup, tenantId } = params;
      let menuData: MS_INDEX.IMicroServiceMenu[] = [];
      if (isEmpty(microServiceMenu)) {
        // 如果菜单数据为空说明是第一次进入具体微服务，请求菜单接口
        menuData = await call(microService.getMicroServiceMenuList, { tenantGroup, tenantId });
      }

      const [firstMenu] = menuData;
      const siderName = `${currentLocale.key === 'zh' ? firstMenu.cnName : firstMenu.enName}(${envMap[env]})`;
      microServiceMenu = generateMSMenu(menuData, params, query);
      const msMenuMap = {};
      menuData.forEach((m) => {
        msMenuMap[m.key] = m;
        if (m.children) {
          m.children.forEach((cm) => { msMenuMap[cm.key] = cm; });
        }
      });
      await update({ microServiceMenu, msMenuMap });

      layoutStore.reducers.setSubSiderInfoMap({
        key: 'microServiceDetail',
        menu: filter(microServiceMenu, n => !isEmpty(n)),
        loading: false,
        detail: {
          logoClassName: 'big-icon',
          logo: wfwzl_svg,
          name: siderName,
        },
      });

      if (routes[0].mark === 'microServiceDetail') { // 总览页过来的进入拓扑图
        goTo(goTo.pages.microServiceTopology, { replace: true, tenantGroup, projectId, env, terminusKey: get(menuData, '[0].children[0].params.terminusKey') });
      }
      return menuData;
    },
  },
  reducers: {
    updateClusterInfo(state, { clusterType, isK8S, clusterName, DICE_CLUSTER_TYPE }) {
      state.clusterName = clusterName;
      state.clusterType = clusterType;
      state.isK8S = isK8S;
      state.DICE_CLUSTER_TYPE = DICE_CLUSTER_TYPE;
    },
    clearMenuInfo(state) {
      state.microServiceMenu = [];
    },
  },

});

export default microServiceStore;
