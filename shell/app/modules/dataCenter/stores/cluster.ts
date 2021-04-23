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

import i18n from 'i18n';
import { isEmpty, get } from 'lodash';
import { createStore } from 'app/cube';
import {
  getClusterList,
  addCluster,
  updateCluster,
  getClusterDetail,
  getCurDeployCluster,
  deployCluster,
  getDeployClusterLog,
  killDeployCluster,
  getCloudPreview,
  addCloudCluster,
  getClusterLogTasks,
  upgradeCluster,
  deleteCluster,
  viewClusterStatus,
  getClusterNewDetail,
  getClusterResourceList,
  getClusterResourceDetail,
  getSMSNotifyConfig,
} from '../services/cluster';
import orgStore from 'app/org-home/stores/org';

interface IState {
  list: ORG_CLUSTER.ICluster[];
  detail: ORG_CLUSTER.ICluster;
  deployingCluster: any;
  getDeployClusterLog: any;
  deployClusterLog: string;
  cloudResource: ORG_CLUSTER.ICloudResource[];
  cloudResourceDetail: ORG_CLUSTER.ICloudResourceDetail;
  enableMS: boolean;
}

const initState: IState = {
  list: [],
  detail: {} as ORG_CLUSTER.ICluster,
  deployingCluster: null,
  deployClusterLog: '',
  getDeployClusterLog: {},
  cloudResource: [],
  cloudResourceDetail: {},
  enableMS: false,
};

const cluster = createStore({
  name: 'org-cluster',
  state: initState,
  effects: {
    async getSMSNotifyConfig({ call, update }, payload: {orgId: number}) {
      const notifyConfig = await call(getSMSNotifyConfig, { orgId: payload.orgId });
      const enableMS = get(notifyConfig, 'config.enableMS');
      update({ enableMS });
    },
    async getClusterList({ call, update }, payload: { orgId?: number; } = {}) {
      const userOrgId = orgStore.getState(s => s.currentOrg.id);
      const orgId = isEmpty(payload) ? userOrgId
        : payload.orgId || userOrgId;
      const list = await call(getClusterList, { orgId });
      if (list && list.length) {
        update({ list });
      }
      return list || [];
    },
    async addCluster({ call }, payload: ORG_CLUSTER.IAddClusterQuery) {
      const orgId = orgStore.getState(s => s.currentOrg.id);
      await call(addCluster, { ...payload, orgId }, { successMsg: i18n.t('dcos:add cluster success') });
      await cluster.effects.getClusterList({});
    },
    async updateCluster({ call, update, select }, payload: ORG_CLUSTER.IAddClusterQuery) {
      const prevDetail = select(s => s.detail);
      await call(updateCluster, payload, { successMsg: i18n.t('dcos:modify cluster success') });
      if (payload.id === prevDetail.id) { // 修改了当前detail中的集群
        update({ detail: { ...prevDetail, ...payload } });
      }
      await cluster.effects.getClusterList({});
    },
    async getClusterDetail({ call, update, select }, payload: { clusterId?: number; clusterName?: string; }) {
      const prevDetail = select(s => s.detail);
      const { id, name } = prevDetail;
      if ((id && id === payload.clusterId) || (name && name === payload.clusterName)) return prevDetail;
      const detail = await call(getClusterDetail, payload);
      update({ detail: detail || {} });
      return detail;
    },
    async getClusterNewDetail({ call }, payload: {clusterName: string}) {
      const res = await call(getClusterNewDetail, payload);
      return res;
    },
    // 部署物理集群 start=====
    async getCurDeployCluster({ call, update }) {
      const res = await call(getCurDeployCluster);
      const deployingCluster = res || {};
      update({ deployingCluster });
    },
    async deployCluster({ call, update }, payload: any) {
      const deployingCluster = await call(deployCluster, { ...payload }, { successMsg: i18n.t('dcos:start deployment, you can view the log') });
      update({ deployingCluster });
      return true;
    },
    async getDeployClusterLog({ call, update }) {
      const orgId = orgStore.getState(s => s.currentOrg.id);
      const deployingCluster = cluster.getState(s => s.deployingCluster);
      const { deployID } = deployingCluster || {};
      const deployClusterLog = await call(getDeployClusterLog, { deployID, orgID: orgId });
      update({ deployClusterLog });
    },
    async killDeployCluster({ call, update }) {
      const orgId = orgStore.getState(s => s.currentOrg.id);
      await call(killDeployCluster, { orgID: orgId }, { successMsg: i18n.t('dcos:deployment has stopped') });
      update({ deployingCluster: {} });
    },
    async getCloudPreview({ call }, payload: ORG_CLUSTER.IAliyunCluster) {
      const res = await call(getCloudPreview, payload);
      return res;
    },
    async addCloudCluster({ call }, payload: ORG_CLUSTER.IAliyunCluster) {
      const res = await call(addCloudCluster, payload);
      return res;
    },
    async getClusterLogTasks({ call }, payload: { recordIDs: string }) {
      const res = await call(getClusterLogTasks, payload);
      return res;
    },
    async upgradeCluster({ call }, payload: { clusterName: string; precheck: boolean }) {
      const orgId = orgStore.getState(s => s.currentOrg.id);
      const res = await call(upgradeCluster, { orgID: orgId, ...payload });
      return res;
    },
    async deleteCluster({ call }, payload: { clusterName:string }) {
      const orgId = orgStore.getState(s => s.currentOrg.id);
      const res = await call(deleteCluster, { orgID: orgId, ...payload });
      cluster.effects.getClusterList();
      return res;
    },
    async viewClusterStatus({ call }, payload:{clusterName:string}) {
      const res = await call(viewClusterStatus, { ...payload });
      return res;
    },
    async getClusterResourceList({ call, update }, payload: { cluster: string }) {
      const cloudResource = await call(getClusterResourceList, payload);
      update({ cloudResource });
      return cloudResource;
    },
    async getClusterResourceDetail({ call, update }, payload: { cluster: string; resource: string }) {
      const { resource } = payload;
      const res = await call(getClusterResourceDetail, payload);
      const cloudResourceDetail = cluster.getState(s => s.cloudResourceDetail) as ORG_CLUSTER.ICloudResourceDetail;
      const newData = { ...cloudResourceDetail, [resource]: res };
      update({ cloudResourceDetail: newData });
      return newData;
    },
  },
  reducers: {
    clearDeployCluster(state) {
      state.deployingCluster = null;
      state.deployClusterLog = '';
    },
    clearDeployClusterLog(state) {
      state.deployClusterLog = '';
    },
  },
});

export default cluster;
