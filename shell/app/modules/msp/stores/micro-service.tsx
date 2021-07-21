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
import * as mspService from 'msp/services';
import { envMap, getMSFrontPathByKey, MSIconMap } from 'msp/config';
import { isEmpty, filter, get } from 'lodash';
import layoutStore from 'layout/stores/layout';
import { goTo, qs } from 'common/utils';
import { getCurrentLocale } from 'i18n';
import routeInfoStore from 'core/stores/route';
import { setGlobal } from 'app/global-space';
import wfwzl_svg from 'app/images/wfwzl.svg';
import { FULL_DOC_DOMAIN } from 'common/constants';
import React from 'react';
import switchEnv from 'msp/pages/micro-service/switch-env';

interface IState {
  mspProjectList: MS_INDEX.IMspProject[];
  mspMenu: MS_INDEX.Menu[];
  msMenuMap: MS_INDEX.MenuMap;
  clusterName: string;
  clusterType: string;
  DICE_CLUSTER_TYPE: string;
  isK8S: boolean;
  currentProject: MS_INDEX.IMspProject;
}
const currentLocale = getCurrentLocale();

const generateMSMenu = (menuData: MS_INDEX.IMspMenu[], params: Record<string, any>, query: Record<string, any>) => {
  let queryStr = '';
  if (!isEmpty(query)) {
    queryStr = `?${qs.stringify(query)}`;
  }

  return menuData
    .filter((m) => m.exists)
    .map((menu) => {
      const { key, cnName, enName, children } = menu;
      const href = getMSFrontPathByKey(key, { ...menu.params, ...params } as any);

      const IconComp = MSIconMap[key];
      const siderMenu = {
        key,
        icon: IconComp ? <IconComp /> : 'zujian',
        text: currentLocale.key === 'zh' ? cnName : enName,
        href: `${href}${queryStr}`,
        prefix: `${href}`,
        subMenu: [] as any,
      };
      if (children.length) {
        siderMenu.subMenu = children
          .filter((m) => m.exists)
          .map((child) => {
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
  mspProjectList: [],
  mspMenu: [],
  msMenuMap: {},
  clusterName: '',
  clusterType: '',
  DICE_CLUSTER_TYPE: '',
  isK8S: true,
  currentProject: {},
};

const mspStore = createStore({
  name: 'msp',
  state: initState,
  subscriptions({ listenRoute }: IStoreSubs) {
    listenRoute(({ isEntering, isLeaving }: IRouteInfo) => {
      if (isEntering('mspDetail')) {
        mspStore.effects.getMspMenuList().then((msMenu: MS_INDEX.IMspMenu[]) => {
          if (msMenu.length) {
            const DICE_CLUSTER_NAME = msMenu[0].clusterName;
            const DICE_CLUSTER_TYPE = msMenu[0].clusterType || '';
            const isEdas = DICE_CLUSTER_TYPE.includes('edasv2');
            const isK8S = DICE_CLUSTER_TYPE === 'kubernetes';
            const clusterType = isEdas ? 'EDAS' : 'TERMINUS';
            setGlobal('service-provider', clusterType);
            mspStore.reducers.updateClusterInfo({
              clusterType,
              isK8S,
              clusterName: DICE_CLUSTER_NAME,
              DICE_CLUSTER_TYPE,
            });
          }
        });
      }
      if (isLeaving('mspDetail')) {
        setGlobal('service-provider', undefined);
        mspStore.reducers.updateClusterInfo({
          clusterType: undefined,
          isK8S: undefined,
          clusterName: undefined,
          DICE_CLUSTER_TYPE: undefined,
        });
        mspStore.reducers.clearMenuInfo();
      }
    });
  },
  effects: {
    async getMspProjectList({ call, update }) {
      const mspProjectList = await call(mspService.getMspProjectList);
      await update({ mspProjectList });
    },
    async getMspMenuList({ call, select, update }) {
      const [params, routes, query] = routeInfoStore.getState((s) => [s.params, s.routes, s.query]);
      let mspMenu = await select((s) => s.mspMenu);
      const { env, projectId, tenantGroup, tenantId } = params;
      let menuData: MS_INDEX.IMspMenu[] = [];
      if (isEmpty(mspMenu)) {
        // 如果菜单数据为空说明是第一次进入具体微服务，请求菜单接口
        menuData = await call(mspService.getMspMenuList, { tenantGroup, tenantId });
      }

      const [firstMenu] = menuData;
      const siderName = `${currentLocale.key === 'zh' ? firstMenu.cnName : firstMenu.enName}(${envMap[env]})`;
      mspMenu = generateMSMenu(menuData, params, query);
      const msMenuMap = {};
      menuData.forEach((m) => {
        msMenuMap[m.key] = m;
        if (m.children) {
          m.children.forEach((cm) => {
            msMenuMap[cm.key] = cm;
          });
        }
      });
      await update({ mspMenu, msMenuMap });

      layoutStore.reducers.setSubSiderInfoMap({
        key: 'mspDetail',
        menu: filter(mspMenu, (n) => !isEmpty(n)),
        loading: false,
        detail: {
          logoClassName: 'big-icon',
          logo: wfwzl_svg,
          name: siderName,
        },
        getHeadName: switchEnv,
      });

      if (routes[0].mark === 'mspDetail') {
        // 总览页过来的进入拓扑图
        goTo(goTo.pages.mspTopology, {
          replace: true,
          tenantGroup,
          projectId,
          env,
          terminusKey: get(menuData, '[0].children[0].params.terminusKey'),
        });
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
      state.mspMenu = [];
    },
  },
});

export default mspStore;
