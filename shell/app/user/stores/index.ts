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
import i18n from 'i18n';
import {
  login,
  logout,
  validateLicense,
  getJoinedProjects,
  getJoinedApps,
  pinApp,
  unpinApp,
  getJoinedOrgs,
  updateOrg,
} from '../services/user';
import { goTo, setLS } from 'common/utils';
import layoutStore from 'app/layout/stores/layout';
import { PAGINATION } from 'app/constants';

interface IState {
  orgs: ORG.IOrg[],
  projectList: PROJECT.Detail[],
  projectPaging: IPaging,
  appList: IApplication[],
  appPaging: IPaging,
  noAuth: boolean,
  notFound: boolean,
  authContact: string,
  joinOrgTip: string,
  loginUser: ILoginUser,
  licenseInfo: {
    valid: boolean,
    message: string,
    currentHostCount?: number,
    maxHostCount?: number,
    user?: string,
    expireDate?: string,
    issueDate?: string,
  },
}

interface IPagingQuery {
  [k: string]: any,
  pageNo: number,
  pageSize?: number,
  loadMore?: boolean,
}

const initState: IState = {
  orgs: [],
  projectList: [],
  projectPaging: {
    pageNo: 1,
    pageSize: 12,
    total: 0,
    hasMore: false,
  },
  appList: [],
  appPaging: {
    pageNo: 1,
    pageSize: 12,
    total: 0,
    hasMore: false,
  },
  noAuth: false,
  notFound: false,
  authContact: '',
  joinOrgTip: '',
  loginUser: {
    id: '',
    email: '',
    nick: '',
    name: '',
    phone: '',
    avatar: '',
    token: '',
    isSysAdmin: false,
  },
  licenseInfo: {
    valid: true,
    message: '',
    currentHostCount: 0,
    maxHostCount: 0,
    user: '',
    expireDate: '',
    issueDate: '',
  },
};

const userStore = createStore({
  name: 'users',
  state: initState,
  subscriptions({ listenRoute }: IStoreSubs) {
    listenRoute(({ currentRoute }) => {
      if (!currentRoute.tabs) {
        userStore.reducers.cleanNoAuth();
      }
      userStore.reducers.clearNotFound();
      if (location.pathname === '/' || location.pathname === '') {
        // 根路径进入到组织导航页
        // userStore.reducers.onIndexEnter();
      }
      if (location.pathname.includes('/noAuth')) {
        userStore.reducers.setNoAuth();
      }
    });
  },
  effects: {
    async login({ call, select }) {
      const data = await call(login);
      // effects
      const loginUser = select(s=>s.loginUser);
      if (data && data.url) {
        
        !loginUser.isSysAdmin && window.localStorage.setItem('lastPath', window.location.href);
        window.location.href = data.url;
      }
    },
    async logout({ call, select }) {
      const data = await call(logout);
      setLS('diceLoginState', false);
      const loginUser = select(s=>s.loginUser);
      if (data && data.url) {
        !loginUser.isSysAdmin && window.localStorage.setItem('lastPath', window.location.href);
        window.location.href = data.url;
      }
    },
    async validateLicense({ call, update }) {
      try {
        const res = await call(validateLicense);
        const { valid, message, license, currentHostCount } = res;
        const { data: { maxHostCount }, ...rest } = license;
        update({ licenseInfo: { valid, message, ...rest as any, currentHostCount, maxHostCount } });
        return { valid };
      } catch (error) {
        if (error.message && error.message.includes('the network is offline')) {
          update({ licenseInfo: { valid: false, message: i18n.t('application:fetch license failed') } });
          return { valid: false };
        } else {
          // license接口事实不通
          update({ licenseInfo: { valid: true, message: i18n.t('application:fetch license interface failed') } });
          return { valid: true, showAlert: true };
        }
      }
    },
    async getJoinedOrgs({ call, update }) {
      const { list } = await call(getJoinedOrgs);
      update({ orgs: list });
    },
    async getJoinedProjects({ call, update, select }, payload: Merge<{ searchKey?: string }, IPagingQuery>) {
      const { pageNo = 1, pageSize = PAGINATION.pageSize, searchKey, loadMore, ...rest } = payload;
      const params = { pageNo, pageSize, q: searchKey };
      const { list, total } = await call(getJoinedProjects, { ...params, ...rest }, { paging: { key: 'projectPaging' } });
      let projectList = select(state => state.projectList);
      if (loadMore && pageNo !== 1) {
        projectList = projectList.concat(list);
      } else {
        projectList = list;
      }
      update({ projectList });
      return { list: projectList, total };
    },
    async getJoinedApps({ call, update, select }, payload) {
      const { pageNo = 1, pageSize = PAGINATION.pageSize, q, loadMore, ...rest } = payload;
      const params = { pageNo, pageSize, q };
      const { list, total } = await call(getJoinedApps, { ...params, ...rest }, { paging: { key: 'appPaging' } });
      let appList = select(state => state.appList);
      if (loadMore) {
        appList = appList.concat(list);
      } else {
        appList = list;
      }
      update({ appList });
      return { list: appList, total };
    },
    async pinApp({ call }, appId: number) {
      await call(pinApp, appId, { successMsg: i18n.t('application:topping successfully') });
    },
    async unpinApp({ call }, appId: number) {
      await call(unpinApp, appId, { successMsg: i18n.t('application:cancel topping successfully') });
    },
    async updateOrg({ call }, payload: Partial<ORG.IOrg>) {
      await call(updateOrg, payload);
      await userStore.effects.getJoinedOrgs();
    },
    /**
     * payload: {
     *   type: string // resource type, one of ['org', 'project', 'app']
     *   id: string // resource id
     *   routeMark: string // resource routeMark
     *   cb: callback after get permission // 同时调用多次请求时，第一个请求完成会触发所有take，所以用回调
     * }
     */
  },
  reducers: {
    setLoginUser(state, userData: ILoginUser) {
      state.loginUser = userData;
    },
    setJoinOrgTip(state, joinOrgTip: string) {
      state.joinOrgTip = joinOrgTip;
    },
    onIndexEnter(state) {
      const { loginUser } = state;
      const { currentApp = {}, appList } = layoutStore.getState(s => s);
      let pathname = currentApp.href;
      if (loginUser.id !== undefined) {
        const isSysManager = loginUser.isSysAdmin;
        // 当前为系统管理员
        if (isSysManager && currentApp.key !== 'sysAdmin') {
          // pathname = sysAdminApp[0].href;
        } else if (!isSysManager && currentApp.key === 'sysAdmin') {
          // 当前为非系统管理员
          pathname = appList[0].href;
        }
        setTimeout(() => {
          goTo(pathname, { replace: true });
        }, 0);
      }
    },
    setNotFound(state) {
      state.notFound = true;
    },
    clearNotFound(state) {
      state.notFound = false;
    },
    setNoAuth(state, info?: any) {
      state.noAuth = true;
      state.authContact = info;
    },
    updateOrgs(state, list: ORG.IOrg[]) {
      state.orgs = list;
    },
    cleanNoAuth(state) {
      state.noAuth = false;
      state.authContact = '';
    },
    clearAppList(state) {
      state.appList = [];
      state.appPaging = {
        pageNo: 1,
        pageSize: 12,
        total: 0,
        hasMore: false,
      };
    },
    clearProjectList(state) {
      state.projectList = [];
      state.projectPaging = {
        pageNo: 1,
        pageSize: 12,
        total: 0,
        hasMore: false,
      };
    },
  },
});

export default userStore;
