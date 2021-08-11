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
import { goTo } from 'common/utils';
import { getSubSiderInfoMap, getAppCenterAppList } from 'app/menus';
import layoutStore from 'layout/stores/layout';
import { orgPerm } from 'user/stores/_perm-org';
import { createStore } from 'core/cube';
import userStore from 'app/user/stores';
import { getOrgByDomain, getJoinedOrgs, updateOrg } from '../services/org';
import { getGlobal } from 'app/global-space';
import { getResourcePermissions } from 'user/services/user';
import permStore from 'user/stores/permission';
import breadcrumbStore from 'app/layout/stores/breadcrumb';
import { get, intersection, map, isEmpty } from 'lodash';

interface IState {
  currentOrg: ORG.IOrg;
  curPathOrg: string;
  orgs: ORG.IOrg[];
  initFinish: boolean;
}

const initState: IState = {
  currentOrg: {} as ORG.IOrg,
  curPathOrg: '',
  orgs: [],
  initFinish: false,
};

const org = createStore({
  name: 'org',
  state: initState,
  subscriptions: async ({ listenRoute }: IStoreSubs) => {
    listenRoute(({ params, isIn, isMatch, isLeaving }) => {
      if (isIn('orgIndex')) {
        const isSysAdmin = getGlobal('erdaInfo.isSysAdmin');
        const { orgName } = params;
        const [curPathOrg, initFinish] = org.getState((s) => [s.curPathOrg, s.initFinish]);
        if (!isSysAdmin && initFinish && curPathOrg !== orgName && !isMatch(/\w\/notFound/)) {
          layoutStore.reducers.clearLayout();
          org.effects.getOrgByDomain({ orgName });
        }
      }

      if (isLeaving('orgIndex')) {
        org.reducers.clearOrg();
      }
    });
  },
  effects: {
    async updateOrg({ call, update }, payload: Merge<Partial<ORG.IOrg>, { id: number }>) {
      const currentOrg = await call(updateOrg, payload);
      await org.effects.getJoinedOrgs(true);
      update({ currentOrg });
    },
    async getOrgByDomain({ call, update, select }, payload: { orgName: string }) {
      let domain = window.location.hostname;
      if (domain.startsWith('local')) {
        domain = domain.split('.').slice(1).join('.');
      }
      const { orgName } = payload;
      // if orgName exist, check valid
      let resOrg = await call(getOrgByDomain, { domain, orgName });
      const orgs = select((s) => s.orgs); // get joined orgs

      if (!orgName) return;
      if (orgName === '-' && isEmpty(resOrg)) {
        if (orgs?.length) {
          goTo(`/${get(orgs, '[0].name')}`, { replace: true });
          resOrg = orgs[0];
        }
        update({ curPathOrg: orgName, initFinish: true });
      }
      const curPathname = location.pathname;
      if (isEmpty(resOrg)) {
        goTo(goTo.pages.notFound);
      } else {
        const currentOrg = resOrg || {};
        const orgId = currentOrg.id;
        if (curPathname.startsWith(`/${orgName}/inviteToOrg`)) {
          if (orgs?.find((x) => x.name === currentOrg.name)) {
            goTo(`/${currentOrg.name}`, { replace: true });
          }
        }
        // user doesn't joined the public org, go to dop
        // temporary solution, it will removed until new solution is proposed by PD
        if (resOrg?.isPublic && curPathname?.split('/')[2] !== 'dop') {
          if (!orgs?.find((x) => x.name === currentOrg.name) || orgs?.length === 0) {
            goTo(goTo.pages.dopRoot, { replace: true });
          }
        }
        if (currentOrg.name !== orgName) {
          goTo(location.pathname.replace(`/${orgName}`, `/${currentOrg.name}`), { replace: true }); // just replace the first match, which is org name
        }
        if (orgId) {
          // const setHeader = (req: any) => {
          //   req.set('org', currentOrg.name);
          // }
          // agent.use(setHeader);

          const orgPermQuery = { scope: 'org', scopeID: `${orgId}` };
          (getResourcePermissions(orgPermQuery) as unknown as Promise<IPermResponseData>).then((orgPermRes) => {
            const orgAccess = get(orgPermRes, 'data.access');
            // 当前无该企业权限
            if (!orgAccess) {
              const joinOrgTip = map(orgPermRes.userInfo, (u) => u.nick).join(', ');
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

            if (orgAccess) {
              // 有企业权限，正常用户
              const appMap = {} as {
                [k: string]: LAYOUT.IApp;
              };
              permStore.reducers.updatePerm(orgPermQuery.scope, orgPermRes.data);
              const menusMap = getSubSiderInfoMap();
              const appCenterAppList = getAppCenterAppList();
              appCenterAppList.forEach((a) => {
                appMap[a.key] = a;
              });
              layoutStore.reducers.initLayout({
                appList: appCenterAppList,
                currentApp: appMap.dop,
                menusMap,
                key: 'dop',
              });
            }
          });
          breadcrumbStore.reducers.setInfo('curOrgName', currentOrg.displayName);
          update({ currentOrg, curPathOrg: payload.orgName, initFinish: true });
        }
      }
    },
    async getJoinedOrgs({ call, select, update }, force?: boolean) {
      const orgs = select((state) => state.orgs);
      if (isEmpty(orgs) || force) {
        const { list } = await call(getJoinedOrgs);
        update({ orgs: list });
      }
    },
  },
  reducers: {
    updateJoinedOrg(state, orgs: ORG.IOrg[]) {
      state.orgs = orgs;
    },
    clearOrg(state) {
      breadcrumbStore.reducers.setInfo('curOrgName', '');
      state.currentOrg = {} as ORG.IOrg;
      // const setHeader = (req: any) => {
      //   req.set('org', '');
      // }
      // agent.use(setHeader);
    },
  },
});

export default org;

const dataEngineerInfo = process.env.dataEngineerInfo as unknown as { indexUrl: string; name: string };

const setLocationByAuth = (authObj: Obj) => {
  const curPathname = location.pathname;
  const { roles, hasAuth, orgName } = authObj;
  const checkMap = {
    dataEngineer: {
      isCurPage: curPathname.startsWith(`/${orgName}/${dataEngineerInfo.name}`),
      authRole: intersection(orgPerm.entryFastData.role, roles),
    },
    orgCenter: {
      isCurPage: curPathname.startsWith(`/${orgName}/orgCenter`),
      authRole: intersection(orgPerm.entryOrgCenter.role, roles),
    },
    msp: {
      isCurPage: curPathname.startsWith(`/${orgName}/msp`),
      authRole: intersection(orgPerm.entryMsp.role, roles),
    },
    ecp: {
      isCurPage: curPathname.startsWith(`/${orgName}/ecp`),
      authRole: intersection(orgPerm.ecp.view.role, roles),
    },
    cmp: {
      isCurPage: curPathname.startsWith(`/${orgName}/cmp`),
      authRole: intersection(orgPerm.cmp.showApp.role, roles),
    },
    dop: {
      isCurPage: curPathname.startsWith(`/${orgName}/dop`),
      authRole: intersection(orgPerm.dop.read.role, roles),
    },
    // apiManage: {
    //   isCurPage: curPathname.startsWith('/apiManage'),
    //   authRole: intersection(orgPerm.entryApiManage.role, roles),
    // },
  };

  if (hasAuth) {
    map(checkMap, (item) => {
      // 当前页，但是无权限，则重置
      if (item.isCurPage && isEmpty(item.authRole)) {
        let resetPath = goTo.resolve.orgRoot({ orgName });
        if (roles.toString() === 'DataEngineer') {
          // DataEngineer redirect to DataEngineer role page
          resetPath = dataEngineerInfo?.indexUrl?.replace('{orgName}', get(location.pathname.split('/'), '[1]') || '-');
        } else if (roles.toString() === 'Ops') {
          // 企业运维只有云管的权限
          resetPath = `/${orgName}/cmp/overview`;
        } else if (roles.toString() === 'EdgeOps') {
          // 边缘运维工程师只有边缘计算平台的权限
          resetPath = `/${orgName}/ecp/application`;
        }

        location.href = resetPath;
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
