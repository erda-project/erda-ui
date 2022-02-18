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
import i18n from 'i18n';
import { getDefaultPaging } from 'common/utils';
import {
  getExtensions,
  getActionGroup,
  getActionConfigs,
  getReleaseByWorkspace,
  getLaunchedDeployList,
  getApprovalList,
  updateApproval,
} from '../services/deploy';
import { isEmpty } from 'lodash';

interface IState {
  actions: DEPLOY.ExtensionAction[];
  groupActions: Obj<DEPLOY.IGroupExtensionActionObj[]>;
  actionConfigs: DEPLOY.ActionConfig[];
  launchedDeployList: DEPLOY.IDeploy[];
  launchedDeployPaging: IPaging;
  approvalList: DEPLOY.IDeploy[];
  approvalPaging: IPaging;
}

const initState: IState = {
  actions: [],
  groupActions: {},
  actionConfigs: [],
  launchedDeployList: [],
  launchedDeployPaging: getDefaultPaging(),
  approvalList: [],
  approvalPaging: getDefaultPaging(),
};

const deploy = createStore({
  name: 'appDeploy',
  state: initState,
  effects: {
    async getActions({ call, update }) {
      const actions = (await call(getExtensions)) as DEPLOY.ExtensionAction[];
      if (!isEmpty(actions)) {
        update({ actions });
      }
      return actions;
    },
    async getGroupActions({ call, update }, payload: { labels?: string } = {}) {
      const groupActions = await call(getActionGroup, payload);
      if (!isEmpty(groupActions)) {
        update({ groupActions });
      }
      return groupActions;
    },
    async getActionConfigs({ call, update }, payload: any) {
      const actionConfigs = await call(getActionConfigs, payload);
      if (!isEmpty(actionConfigs)) {
        update({ actionConfigs });
      }
      return actionConfigs;
    },
    async getReleaseByWorkspace({ call, getParams }, payload: { workspace: string }) {
      const { appId } = getParams();
      const res = await call(getReleaseByWorkspace, { appId, ...payload });
      return res;
    },
    async getLaunchedDeployList({ call, update }, payload: IPagingReq) {
      const res = await call(getLaunchedDeployList, { ...payload }, { paging: { key: 'launchedDeployPaging' } });
      update({ launchedDeployList: res.list });
      return res;
    },
    async getApprovalList({ call, update }, payload: IPagingReq) {
      const res = await call(getApprovalList, { ...payload }, { paging: { key: 'approvalPaging' } });
      update({ approvalList: res.list });
      return res;
    },
    async updateApproval({ call }, payload: DEPLOY.IUpdateApproveBody) {
      const res = await call(updateApproval, payload, { successMsg: i18n.t('operated successfully') });
      return res;
    },
  },
  reducers: {
    clearDeployList(state, type) {
      const keyMap = {
        approval: {
          listKey: 'approvalList',
          pagingKey: 'approvalPaging',
        },
        launched: {
          listKey: 'launchedDeployList',
          pagingKey: 'launchedDeployPaging',
        },
      };
      if (keyMap[type]) {
        const { listKey, pagingKey } = keyMap[type];
        state[listKey] = [];
        state[pagingKey] = getDefaultPaging();
      }
    },
    clearLaunchedDeployList(state) {
      state.launchedDeployList = [];
      state.launchedDeployPaging = getDefaultPaging();
    },
  },
});

export default deploy;
