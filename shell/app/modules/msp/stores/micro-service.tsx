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

import { createStore } from 'core/cube';
import * as mspService from 'msp/services';
import { envMap, getMSFrontPathByKey, MSIconMap } from 'msp/config';
import { isEmpty, filter, get } from 'lodash';
import layoutStore from 'layout/stores/layout';
import { goTo, qs } from 'common/utils';
import { getCurrentLocale } from 'i18n';
import routeInfoStore from 'core/stores/route';
import { setGlobal } from 'app/global-space';
import wfwzl_svg from 'app/images/wfwzl.svg';
import {
  DOC_PREFIX,
  DOC_MSP_API_GATEWAY,
  DOC_MSP_REGISTER,
  DOC_MSP_MONITOR,
  DOC_MSP_CONFIG_CENTER,
} from 'common/constants';
import React from 'react';
import switchEnv from 'msp/pages/micro-service/switch-env';
import breadcrumbStore from 'layout/stores/breadcrumb';

const docUrlMap = {
  apiGatewayIntro: DOC_MSP_API_GATEWAY,
  registerCenterIntro: DOC_MSP_REGISTER,
  configCenterIntro: DOC_MSP_CONFIG_CENTER,
  monitorIntro: DOC_MSP_MONITOR,
};

interface IState {
  mspProjectList: MS_INDEX.IMspProject[];
  mspMenu: MS_INDEX.Menu[];
  msMenuMap: MS_INDEX.MenuMap;
  clusterName: string;
  clusterType: string;
  DICE_CLUSTER_TYPE: string;
  isK8S: boolean;
  currentEnvInfo: {
    projectId: string;
    env: MS_INDEX.IMspProjectEnv;
    tenantGroup: string;
  };
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
              href: child.href ? docUrlMap[child.href] || `${DOC_PREFIX}${child.href}` : `${childHref}${queryStr}`,
              prefix: `${childHref}`,
            };
          });
      }
      return siderMenu;
    });
};

export const initMenu = (refresh = false) => {
  mspStore.effects.getMspMenuList({ refresh }).then((msMenu: MS_INDEX.IMspMenu[]) => {
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
};

const initState: IState = {
  mspProjectList: [],
  mspMenu: [],
  msMenuMap: {},
  clusterName: '',
  clusterType: '',
  DICE_CLUSTER_TYPE: '',
  isK8S: true,
  currentEnvInfo: {},
  currentProject: {},
};

const mspStore = createStore({
  name: 'msp',
  state: initState,
  subscriptions({ listenRoute }: IStoreSubs) {
    listenRoute(async ({ params, isLeaving, isIn }: IRouteInfo) => {
      const { projectId, tenantGroup, env } = params;
      const mspReg = /\/msp\/\d+\/[A-Z]+\/[a-z0-9A-Z]+$/;
      const isMspDetailIndex = mspReg.test(location.href);
      const [currentEnvInfo, currentProject] = mspStore.getState((s) => [s.currentEnvInfo, s.currentProject]);
      if (isIn('mspDetail')) {
        if (projectId !== currentEnvInfo.projectId) {
          mspStore.reducers.updateCurrentEnvInfo({ projectId, env, tenantGroup });
          await mspStore.effects.getMspProjectDetail();
          initMenu(true);
        } else if (isMspDetailIndex && (env !== currentEnvInfo.env || tenantGroup !== currentEnvInfo.tenantGroup)) {
          mspStore.reducers.updateCurrentEnvInfo({ projectId, env, tenantGroup });
          initMenu(true);
        } else if (isMspDetailIndex && currentProject.type) {
          initMenu();
        }
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
        mspStore.reducers.updateCurrentEnvInfo({});
        mspStore.reducers.clearMspProjectInfo();
        breadcrumbStore.reducers.setInfo('mspProjectName', '');
      }
    });
  },
  effects: {
    async getMspProjectDetail({ call, update, getParams }) {
      const { projectId } = getParams();
      const projectDetail = await call(mspService.getMspProjectDetail, { projectId });
      breadcrumbStore.reducers.setInfo('mspProjectName', projectDetail.displayName);
      update({
        currentProject: projectDetail || {},
      });
    },
    async getMspMenuList({ call, select, update }, payload?: { refresh: boolean }) {
      const [params, routes, query] = routeInfoStore.getState((s) => [s.params, s.routes, s.query]);
      let [mspMenu, currentProject] = await select((s) => [s.mspMenu, s.currentProject]);
      const { env, tenantGroup } = params;
      let menuData: MS_INDEX.IMspMenu[] = [];
      if (isEmpty(mspMenu) || payload?.refresh) {
        // 如果菜单数据为空说明是第一次进入具体微服务，请求菜单接口
        menuData = await call(mspService.getMspMenuList, { tenantId: tenantGroup, type: currentProject.type });
        mspMenu = generateMSMenu(menuData, params, query);
      }
      const [firstMenu] = mspMenu;
      const firstMenuHref = get(firstMenu, 'subMenu.[0].href');
      const siderName = `${firstMenu.text}(${envMap[env]})`;
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
        goTo(firstMenuHref, {
          replace: true,
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
    clearMspProjectInfo(state) {
      state.currentProject = {};
    },
    updateCurrentEnvInfo(state, payload) {
      state.currentEnvInfo = payload;
    },
  },
});

export default mspStore;
