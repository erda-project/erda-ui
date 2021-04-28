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
import diceEnv from 'dice-env';
import { goTo } from 'common/utils';
import { getSubSiderInfoMap, appCenterAppList } from 'app/menus';
import layoutStore from 'layout/stores/layout';
import { orgPerm } from 'user/stores/_perm-org';
import { createStore } from 'app/cube';
import userStore from 'app/user/stores';
import { getOrgByDomain } from '../services/org';
import { getGlobal } from 'app/global-space';
import { getResourcePermissions, getJoinedOrgs } from 'user/services/user';
import permStore from 'user/stores/permission';
import agent from 'agent';
import { get, intersection, map, isEmpty } from 'lodash';

interface IState {
  currentOrg: ORG.IOrg
  curPathOrg: string;
}

const initState: IState = {
  currentOrg: {} as ORG.IOrg,
  curPathOrg: '',
};

const org = createStore({
  name: 'org',
  state: initState,
  subscriptions: async ({ listenRoute }: IStoreSubs) => {
    listenRoute(({ params, isIn, isLeaving }) => {
      if (isIn('orgIndex')) {
        const isSysAdmin = getGlobal('erdaInfo.isSysAdmin');
        const { orgName } = params;
        const curPathOrg = org.getState(s => s.curPathOrg);
        if (!isSysAdmin && curPathOrg !== orgName) {
          org.effects.getOrgByDomain({ orgName });
        }
      }

      if (isLeaving('orgIndex')) {
        org.reducers.clearOrg();
      }
    });
  },
  effects: {
    async getOrgByDomain({ call, update }, payload: { orgName: string }) {
      let domain = window.location.hostname;
      if (domain.startsWith('local')) {
        domain = domain.split('.').slice(1).join('.');
      }
      const { orgName } = payload;
      if (!orgName) return;
      const resOrg = await call(getOrgByDomain, { domain, orgName });
      if (isEmpty(resOrg)) {
        if (orgName === '-') {
          const orgs = await call(getJoinedOrgs); // get Default org
          if (orgs?.list?.length) {
            location.href = `/${get(orgs, 'list[0].name')}`
            return;
          }
          update({ curPathOrg: orgName })
          return
        }
        goTo(goTo.pages.notFound);
      } else {
        const currentOrg = resOrg || {};
        const orgId = currentOrg.id;
        if (orgId) {

          const setHeader = (req: any) => {
            req.set('org', currentOrg.name);
          }
          agent.use(setHeader);

          const orgPermQuery = { scope: 'org', scopeID: `${orgId}` };
          (getResourcePermissions(orgPermQuery) as unknown as Promise<IPermResponseData>).then((orgPermRes) => {
            const orgAccess = get(orgPermRes, 'data.access');
            // 当前无该企业权限
            if (!orgAccess) {
              const joinOrgTip = map(orgPermRes.userInfo, u => u.nick).join(', ');
              userStore.reducers.setJoinOrgTip(joinOrgTip);
              goTo(goTo.pages.freshMan);
              return;
            }
            // 根据权限重定向
            setLocationByAuth({
              roles: get(orgPermRes, 'data.roles'),
              hasAuth: orgAccess,
              ...payload,
            });

            if (orgAccess) { // 有企业权限，正常用户
              const appMap = {} as {
                [k: string]: LAYOUT.IApp
              };
              permStore.reducers.updatePerm(orgPermQuery.scope, orgPermRes.data);
              const menusMap = getSubSiderInfoMap();
              appCenterAppList.forEach((a) => { appMap[a.key] = a; });
              layoutStore.reducers.initLayout({
                appList: appCenterAppList,
                currentApp: appMap.workBench,
                menusMap,
                key: 'workBench',
              });

            }
          });
          update({ currentOrg, curPathOrg: payload.orgName })
        }
      }
    },
  },
  reducers: {
    clearOrg(state) {
      state.currentOrg = {} as ORG.IOrg;
      const setHeader = (req: any) => {
        req.set('org', '');
      }
      agent.use(setHeader);
    }
  },
});

export default org;

const setLocationByAuth = (authObj: Obj) => {
  const curPathname = location.pathname;
  if (diceEnv.ONLY_FDP) {
    if (!['fdp', 'dataCenter', 'orgCenter'].includes(curPathname.split('/')[2])) {
      window.history.replaceState({}, document.title, goTo.resolve.fdpIndex());
      return;
    }
  }
  const { roles, hasAuth, orgName } = authObj;
  const checkMap = {
    freshMan: {
      isCurPage: curPathname.startsWith(`/${orgName}/freshMan`),
      authRole: [],
    },
    inviteToOrg: {
      isCurPage: curPathname.startsWith(`/${orgName}/inviteToOrg`),
      authRole: [],
    },
    fdp: {
      isCurPage: curPathname.startsWith(`/${orgName}/fdp`),
      authRole: intersection(orgPerm.entryFastData.role, roles),
    },
    orgCenter: {
      isCurPage: curPathname.startsWith(`/${orgName}/orgCenter`),
      authRole: intersection(orgPerm.entryOrgCenter.role, roles),
    },
    microService: {
      isCurPage: curPathname.startsWith(`/${orgName}/microService`),
      authRole: intersection(orgPerm.entryMicroService.role, roles),
    },
    edge: {
      isCurPage: curPathname.startsWith(`/${orgName}/edge`),
      authRole: intersection(orgPerm.edge.view.role, roles),
    },
    dataCenter: {
      isCurPage: curPathname.startsWith(`/${orgName}/dataCenter`),
      authRole: intersection(orgPerm.dataCenter.showApp.role, roles),
    },
    workBench: {
      isCurPage: curPathname.startsWith(`/${orgName}/workBench`),
      authRole: intersection(orgPerm.entryWorkBench.role, roles),
    },
    // apiManage: {
    //   isCurPage: curPathname.startsWith('/apiManage'),
    //   authRole: intersection(orgPerm.entryApiManage.role, roles),
    // },
  };

  if (hasAuth) {
    map(checkMap, item => {
      // 当前页，但是无权限，则重置
      if (item.isCurPage && isEmpty(item.authRole)) {
        let resetPath = '/';
        if (roles.toString() === 'DataEngineer') {
          // 数据工程师只有fdp界面权限
          resetPath = goTo.resolve.fdpIndex();
        } else if (roles.toString() === 'Ops') {
          // 企业运维只有云管的权限
          resetPath = `/${orgName}/dataCenter/overview`;
        }
        window.history.replaceState({}, document.title, resetPath);
      }
    });
  } else {
    if (curPathname.startsWith(`/${orgName}/inviteToOrg`)) return;
    const isAdminPage = curPathname.startsWith(`/${orgName}/sysAdmin`);
    const isSysAdmin = getGlobal('erdaInfo.isSysAdmin');
    if (!(isSysAdmin && isAdminPage)) {
      window.location.href = '/-';
    }
  }
};
