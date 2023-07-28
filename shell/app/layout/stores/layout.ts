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
import { inviteToOrg } from 'layout/services';
import * as DiceWebSocket from 'core/utils/ws';
import { enableIconfont, setApiWithOrg } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import { find, merge } from 'lodash';
import orgStore from 'app/org-home/stores/org';
import { on, emit } from 'core/event-hub';
import React from 'react';
import { getGlobal } from 'core/global-space';

const sendMsgUtilWsReady = async (targetWs: any, msg: { command: '__detach' | '__attach' }) => {
  while (targetWs.readyState !== 1 || targetWs.isReady !== true) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  await layout.effects.notifyWs({ ws: targetWs, ...msg });
};

interface AnnouncementItem {
  [s: string]: any;
  id: number;
  content: string;
}

interface IState {
  currentApp: LAYOUT.IApp;
  appList: LAYOUT.IApp[];
  subSiderInfoMap: Obj;
  sideFold: boolean;
  subList: {
    [k: string]: any;
  };
  announcementList: AnnouncementItem[];
  customMain: Function | JSX.Element | null;
  showMessage: boolean;
  client: {
    height: number;
    width: number;
  };
  scalableImgSrc: string;
  escStack: string[];
  topButtonsWidth: number;
}

const emptyApp = {
  key: '',
  name: '',
  breadcrumbName: '',
  href: '',
} as LAYOUT.IApp;
const initState: IState = {
  currentApp: { ...emptyApp },
  appList: [],
  subSiderInfoMap: {},
  subList: {},
  announcementList: [],
  customMain: null,
  showMessage: false,
  sideFold: false,
  client: {
    height: 0,
    width: 0,
  },
  scalableImgSrc: '',
  escStack: [],
  topButtonsWidth: 0,
};

const layout = createStore({
  name: 'layout',
  state: initState,
  subscriptions: async ({ listenRoute }: IStoreSubs) => {
    const currentOrg = orgStore.getState((s) => s.currentOrg);
    if (currentOrg.id) {
      const diceWs = DiceWebSocket.connect(setApiWithOrg('/api/websocket'));
      listenRoute(({ isEntering, isLeaving }) => {
        if (
          isEntering('pipeline') ||
          isEntering('dataTask') ||
          isEntering('deploy') ||
          isEntering('testPlanDetail') ||
          isEntering('appDeployRuntime') ||
          isEntering('projectDeployRuntime')
        ) {
          // call ws when enter page
          sendMsgUtilWsReady(diceWs, { command: '__attach' });
        } else if (
          isLeaving('pipeline') ||
          isLeaving('dataTask') ||
          isLeaving('deploy') ||
          isLeaving('testPlanDetail') ||
          isLeaving('appDeployRuntime') ||
          isLeaving('projectDeployRuntime')
        ) {
          sendMsgUtilWsReady(diceWs, { command: '__detach' });
        }
      });
    }
    listenRoute(async ({ isIn, isEntering }) => {
      const { switchToApp, switchMessageCenter } = layout.reducers;
      if (isIn('orgCenter')) {
        switchToApp('orgCenter');
      } else if (isIn('cmp')) {
        switchToApp('cmp');
      } else if (isIn('dop')) {
        switchToApp('dop');
      } else if (isIn('msp')) {
        switchToApp('msp');
      } else if (isIn('ecp')) {
        switchToApp('ecp');
      } else if (isIn('apiManage')) {
        switchToApp('apiManage');
      } else if (isIn('fdp')) {
        switchToApp('fdp');
      } else if (isIn('gallery')) {
        switchToApp('gallery');
      } else {
        switchToApp('');
      }

      if (
        isEntering('orgCenter') ||
        isEntering('cmp') ||
        isEntering('dop') ||
        isEntering('msp') ||
        isEntering('ecp') ||
        isEntering('sysAdmin')
      ) {
        enableIconfont('dice-icon');
      }

      switchMessageCenter(false);
    });
    window.addEventListener('resize', () => {
      layout.reducers.setClient();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        emit('pressEsc', { event: e, stack: layout.getState((s) => s.escStack) });
      }
    });
  },
  effects: {
    async notifyWs(_, payload: { ws: any; command: '__detach' | '__attach' }) {
      const { params, prevRouteInfo } = routeInfoStore.getState((s) => s);
      const { ws, command } = payload;
      const { appId, projectId } = params;
      let scopeType = '';
      let id = '';
      if (appId) {
        id = String(appId);
        scopeType = 'app';
        if (command === '__detach') {
          id = prevRouteInfo.params.appId; // in case switch application, so that use prev route to detach ws
        }
      } else if (projectId) {
        id = String(projectId);
        scopeType = 'project';
      }

      ws.send(JSON.stringify({ command, scope: { type: scopeType, id } }));
    },
    async inviteToOrg({ call }, payload: LAYOUT.InviteToOrgPayload) {
      const result = await call(inviteToOrg, payload);
      return result;
    },
  },
  reducers: {
    initLayout(state, payload: LAYOUT.IInitLayout | (() => LAYOUT.IInitLayout)) {
      let _payload = payload;
      if (typeof payload === 'function') {
        _payload = payload();
      }
      const { appList, currentApp, menusMap = {}, key } = (_payload as LAYOUT.IInitLayout) || {};
      const { user } = getGlobal('initData');
      if (key === 'sysAdmin' && !user.isSysAdmin) return;
      let list = [...state.appList, ...appList];
      // Some modules are loaded later, but in a fixed order
      const positionList = list.filter((item) => item.position);
      list = list.filter((item) => !item.position);
      positionList.forEach((item) => {
        list.splice(item.position as number, 0, item);
      });

      if (appList?.length)
        state.appList = list.filter((item, index) => list.findIndex((i) => i.key === item.key) === index);
      if (currentApp) state.currentApp = currentApp;
      state.subSiderInfoMap = merge(state.subSiderInfoMap, menusMap);
    },
    updateAppList(state, payload: { menu: LAYOUT.IApp; position?: number }) {
      const { menu, position } = payload;

      if (!state.appList.find((item) => item.key === menu.key)) {
        if (position !== undefined) {
          const newAppList = [...state.appList];
          newAppList.splice(position, 0, { ...menu, position });
          state.appList = newAppList;
        } else {
          state.appList = [...state.appList, menu];
        }
      }
    },
    clearLayout(state) {
      state.subSiderInfoMap = {};
      state.appList = [];
      state.currentApp = {
        key: '',
        name: '',
        shortName: '',
        icon: '',
        breadcrumbName: '',
        href: '',
      };
    },
    switchToApp(state, payload: string) {
      if (payload === (state.currentApp && state.currentApp.key)) return;
      const curApp = find(state.appList, { key: payload });

      if (curApp) {
        state.currentApp = curApp;
      } else {
        state.currentApp = { ...emptyApp };
      }
    },
    setSubSiderInfoMap(state, payload: { [k: string]: any; key: string }) {
      const { key, ...rest } = payload;

      const siderInfoMap = state.subSiderInfoMap;
      if (!siderInfoMap[key]) {
        siderInfoMap[key] = {};
      }
      siderInfoMap[key] = { ...siderInfoMap[key], ...rest };
    },
    setSubSiderSubList(state, payload: Obj) {
      state.subList = { ...state.subList, ...payload };
    },
    setAnnouncementList(state, list: AnnouncementItem[]) {
      state.announcementList = list;
    },
    clearSubSiderSubList(state) {
      state.subList = {};
    },
    setClient(state) {
      state.client = {
        height: document.body.clientHeight,
        width: document.body.clientWidth,
      };
    },
    switchMessageCenter(state, payload) {
      state.showMessage = typeof payload === 'boolean' ? payload : !state.showMessage;
    },
    setScalableImgSrc(state, src: string) {
      state.scalableImgSrc = src;
    },
    // 动态更改appList中具体某个app的属性值，e.g. { cmp: { href: 'xxxx' } } 来运行时改变href
    updateAppListProperty(state, payload: Obj<Obj>) {
      const [appKey, valueObj] = Object.entries(payload)[0];
      const [key, value] = Object.entries(valueObj)[0];
      const targetApp = state.appList.find((app) => app.key === appKey);
      if (targetApp) {
        targetApp[key] = value;
      }
    },
    toggleSideFold(state, payload: boolean) {
      state.sideFold = payload;
    },
    unshiftEscStack(state, target: string) {
      if (!state.escStack.includes(target)) {
        state.escStack.unshift(target);
      }
    },
    shiftEscStack(state) {
      state.escStack.shift();
    },
    updateTopButtonsWidth(state, payload: number) {
      state.topButtonsWidth = payload;
    },
  },
});

/**
 * @param key escScope
 * @param onPressEscape execute when press esc and match the first item of escStack
 * @returns enterEscScope function, should be called when enlarge your target
 */
export const useEscScope = (key: string, onPressEscape: (e: React.KeyboardEvent) => void) => {
  const onPressEscapeRef = React.useRef(onPressEscape);

  React.useEffect(() => {
    const clearFn = on('pressEsc', (data: { event: React.KeyboardEvent; stack: string[] }) => {
      if (data.stack[0] === key) {
        onPressEscapeRef.current?.(data.event);
        layout.reducers.shiftEscStack();
      }
    });
    return clearFn;
  }, [key]);

  return () => layout.reducers.unshiftEscStack(key);
};

export default layout;
