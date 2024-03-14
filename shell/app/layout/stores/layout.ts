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
import { inviteToOrg, getLicenses } from 'layout/services';
import * as DiceWebSocket from 'core/utils/ws';
import { enableIconfont, setApiWithOrg, goTo } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import { find, merge } from 'lodash';
import JSEncrypt from 'jsencrypt';
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

    // Gets the authorized path
    let features: string[] = [];

    // if (currentOrg.id) {
    //   const res = await getLicenses({ scope: 'PLATFORM' });
    // }

    listenRoute(async ({ params }) => {
      const { orgName } = params;

      if (orgName && orgName !== '-' && !features.length) {
        const res = await getLicenses({ scope: 'PLATFORM' });

        if (res.success) {
          if (res.data) {
            const jse = new JSEncrypt();

            jse.setPrivateKey(PRIVATE_KEY);
            const data = jse.decrypt(res.data);
            if (data) {
              const parseData = JSON.parse(data);
              features = parseData.features;
            }
          } else {
            const orgRes = await getLicenses({ scope: 'ORG' });
            const jse = new JSEncrypt();

            jse.setPrivateKey(PRIVATE_KEY);
            const data = jse.decrypt(orgRes.data);
            if (data) {
              const parseData = JSON.parse(data);
              features = parseData.features;
            }
          }
        }
      }
    });

    // Check whether the current path has permission
    listenRoute(async ({ currentRoute, params }) => {
      const { path } = currentRoute;
      const { orgName } = params;
      if (features.length) {
        if (/\/:orgName\//.test(path)) {
          const isMatch = features.some((feature) => {
            const regexStr = feature.replace(/\*/g, '.+');
            const regex = new RegExp('^' + regexStr + '$');
            const remainingStr = path.replace(/^\/:orgName\//, '');
            return regex.test(remainingStr);
          });
          if (!isMatch) {
            goTo(goTo.pages.noAuth);
          }
        }
      } else {
        if (/^\/:orgName\//.test(path) && orgName !== '-') {
          goTo(goTo.pages.noAuth);
        }
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

      const _applist = JSON.parse(JSON.stringify(state.appList));
      let list = [..._applist, ...(appList || [])];
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

const PRIVATE_KEY = `
-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAwqjO6sYlprkL0ex4o8bbvrNoJjIdxTBWuDD1aTZvV/kCBDCG
26hAlUZ2vsCJ8IUeqR/9gaB3acw8nMX1phARyQPEvCCCmtEUk7ak5i+DU+VRKM3k
NrQf2+Tc35RnZf4K/MQGovSLSFtjnQgBhX7KswB1zFD+xxuOrixCsdAv4TKh3vGX
mnqcIBvSH+84g8/+l6UudOtma7ps6wrJ0IiClkary02szUdsiF5RpltTIYo+9ZYd
KfHoJ2xdZLqCMmijwk7xmvzGx09OlZeYDni/4yqwjc1BRbgYMDBFFmcN9BKvGz66
w8mAb4glN59rjbD6gpv9q3VKMXWek5D3EIL1XQIDAQABAoIBAQC18mVdypHc0W/7
6qUkqDYzfKvnr8ZlzvXvuktY6XmPZ/97fQRAgnbDUJajW4JTX4o2GOGybRPQvwcU
nnAqpTCKjEwyb8zD+pPaMcjWIykEnP6MPk6G1zxEJBpTnPo8ugT5GBz/6cXafxmP
6LDLX6UFRXPV4wsRfm+R22sHmwl12mHI6KhtNXSk9CIqQT6ZnRMw07ZaM+RyhWmV
SdSACV+14bKhzqdI55veygsL0KZJ17exUDyqxY53LKfMSZDEoYWcWeF83m5adiD9
zM6pm/UgRQfHyxT8JDURmMU28o3l4Y9y4dvUpkDf4jGKVkq8liM6nkObr7yHeLzJ
XIJl+FA9AoGBAMO/NfL5UbfzICOEiVR1iFJ1i8BST/N6h2g35UnZMg90KFIO8PVy
QBU+0ccoZkCPqyHHx1xpSvp33F3I5yHE5zReVDI7jO9d4k8BxPiKEQe9Vq6FWpMu
E5UDSeNIhlIAh0LdIYJGjTA/Ekyq8wYJYxAPSUyqu0xtRt8tJ0aMIq9bAoGBAP6T
5vMo6iFG3pc7SxuFhiSCQcmEG+7idt2n0+UrC+DxTxkGNtt05MbFmRZeGNZDXNg1
/IfyIK6JTEryIZjPwV/i9bZfPaUqsfw68kUFW4R1o+XUMnPBUnzw43YtttseC1cH
EMjpwAhVQdSz1z2SxvO8zFLW2J+PVAdI2k0KJYOnAoGBAJ3sANFi1cvrSQ1+mvDZ
1b54+OOTRM9xFhc9qS14HgwbsX/qb/oFT7AUO1hKvpvtjKo3LB7hD82cr9u1/sre
uY0lYRYZty1SeAc3rTq64Nx2o50vFxDQxpmcypqkY0F7DaUjFCqvUq8O42uZK3G+
Vv6Y5pEE2RDixJ+/JQWkf0MrAoGAK+cJvwlhRxfXrzD0hOyD86va+Iul3Y6EfTlC
G5VO2R4ETAZ8U2BXS8gr3GWh1uGLE2ZMBI3HARKAa7RSAu5hJM4ZHbhTAzbXtu3b
dfe0jqVS/IGZqci/Fvjb4TeE/0ixH/MB/AQDr+w0DCBvkBjN4p6+hdKzTOEE1rTD
oOGNEqUCgYEAsP6JzXQZwKdbxiyrF6gxy2tc9eJ05+HUWTT2zlciBMw1pLmAj+j+
JhEGXpznkPQtVtWWqDu0urfgySQvHc2GQHpvrQNvrbGna+BJvvwwVT3cri+cg1a6
LgZBsRR9GPbpNHW6ClJU+2Ao24tvIeyN2kHR2yUFFWeoR117FY7KtIk=
-----END RSA PRIVATE KEY-----
`;

export default layout;
