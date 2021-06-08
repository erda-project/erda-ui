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

import * as dataTaskService from '../services/dataTask';
import i18n from 'i18n';
import appStore from 'application/stores/application';
import routeInfoStore from 'common/stores/route';
import { eventHub } from 'common/utils/event-hub';
import { createStore } from 'app/cube';
import { PAGINATION } from 'app/constants';
import { isEmpty } from 'lodash';

const getAppDetail = () => new Promise((resolve) => {
  const { appId } = routeInfoStore.getState((s) => s.params);
  let appDetail = appStore.getState((s) => s.detail);
  const notSameApp = appId && String(appId) !== String(appDetail.id);
  if (!appId || notSameApp) {
    eventHub.once('appStore/getAppDetail', () => {
      appDetail = appStore.getState((s) => s.detail);
      resolve(appDetail);
    });
  } else {
    resolve(appDetail);
  }
});

const dataTask = createStore({
  name: 'dataTask',
  state: {
    workFlowFiles: [] as any[],
    modelBusinessScope: {} as Obj,
    marketBusinessScope: {} as Obj,
    businessProcessList: [] as any[],
    businessProcessPaging: {} as any,
    outputTableList: [] as any[],
    outputTablePaging: [] as any,
    tableAttrsList: [] as any[],
    tableAttrsPaging: [] as any,
  },
  effects: {
    async getWorkFlowFiles({ call, update }) {
      const { gitRepoAbbrev } = appStore.getState((s) => s.detail);
      if (gitRepoAbbrev) {
        let workFlowFiles = await call(dataTaskService.getWorkFlowFiles, { gitRepoAbbrev });
        workFlowFiles = workFlowFiles && workFlowFiles.map((file: any) => ({ title: file.name }));
        update({ workFlowFiles });
      }
    },
    async batchCreateTask({ call, getParams }, payload) {
      const { appId } = getParams();
      const result = await call(dataTaskService.batchCreateTask, { ...payload, appId }, { successMsg: i18n.t('application:start executing the build') });
      return result;
    },
    async getBusinessScope({ call, update }, payload) {
      const { compName } = payload;
      let { gitRepo } = appStore.getState((s) => s.detail);
      if (!gitRepo) {
        await getAppDetail();
        const appDetail = appStore.getState((s) => s.detail);
        gitRepo = appDetail.gitRepo;
      }
      const businessScope = await call(dataTaskService.getBusinessScope, { remoteUri: gitRepo });
      compName === 'model' ? update({ modelBusinessScope: businessScope }) : update({ marketBusinessScope: businessScope });
    },
    async getBusinessProcesses({ call, update, select }, payload) {
      const { gitRepo } = appStore.getState((s) => s.detail);
      const originalList = select((s) => s.businessProcessList);

      const { pageNo = 1, pageSize = PAGINATION.pageSize, searchKey, ...rest } = payload;
      const params = !isEmpty(searchKey) ? { pageNo, pageSize, keyWord: searchKey } : { pageNo, pageSize };
      const { list, total } = await call(dataTaskService.getBusinessProcesses, { ...params, ...rest, remoteUri: gitRepo }, { paging: { key: 'businessProcessPaging' } }) || {};
      let newList = list;
      if (pageNo !== 1) {
        newList = originalList.concat(list);
      }
      update({ businessProcessList: newList });
      return { total, list: newList };
    },
    async getOutputTables({ call, update, select }, payload) {
      const { gitRepo } = appStore.getState((s) => s.detail);
      const originalList = select((s) => s.outputTableList);

      const { pageNo = 1, pageSize = PAGINATION.pageSize, searchKey, ...rest } = payload;
      const params = !isEmpty(searchKey) ? { pageNo, pageSize, keyWord: searchKey } : { pageNo, pageSize };
      const { list, total } = await call(dataTaskService.getOutputTables, { ...params, ...rest, remoteUri: gitRepo }, { paging: { key: 'outputTablePaging' } }) || {};
      let newList = originalList;
      if (pageNo !== 1) {
        newList = originalList.concat(list);
      }
      update({ outputTableList: newList });
      return { total, list: newList };
    },
    async getTableAttrs({ call, update }, payload) {
      const { list: tableAttrsList = [], total } = await call(dataTaskService.getTableAttrs, payload, { paging: { key: 'tableAttrsPaging' } });
      update({ tableAttrsList });
      return { total, list: tableAttrsList };
    },
    async getStarChartSource({ call, getParams }) {
      const { filePath } = getParams();
      const startChartSource = await call(dataTaskService.getStarChartSource, { filePath });
      return startChartSource;
    },
  },
  reducers: {
    clearWorkFlowFiles(state) {
      state.workFlowFiles = [];
    },
    clearBusinessScope(state, payload) {
      const { compName } = payload;
      if (compName === 'model') {
        state.modelBusinessScope = {};
      } else {
        state.marketBusinessScope = {};
      }
    },
    clearBusinessProcesses(state) {
      state.businessProcessList = [];
    },
    clearOutputTables(state) {
      state.outputTableList = [];
    },
  },
});

export default dataTask;
