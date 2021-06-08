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
import * as Service from '../services/api-access';
import { getDefaultPaging } from 'common/utils';
import i18n from 'i18n';

interface IState {
  accessList: API_ACCESS.AccessListItem[];
  accessListPaging: IPaging;
  accessDetail: API_ACCESS.AccessDetail;
  clientList: any[];
  clientPaging: IPaging;
  apiGateways: API_ACCESS.ApiGateway[];
  operationRecord: API_ACCESS.OperationRecord[];
  slaList: API_ACCESS.SlaItem[];
  slaListMapper: {[key: number]: API_ACCESS.SlaItem};
}

const initState: IState = {
  accessList: [],
  accessListPaging: getDefaultPaging(),
  accessDetail: {
    access: {},
    tenantGroup: {},
    permission: {
      edit: false,
      delete: false,
    },
  } as API_ACCESS.AccessDetail,
  clientList: [],
  clientPaging: getDefaultPaging(),
  apiGateways: [],
  operationRecord: [],
  slaList: [],
  slaListMapper: {} as {[key: number]: API_ACCESS.SlaItem},
};

const apiAccess = createStore({
  name: 'apiAccess',
  state: initState,
  effects: {
    async getAccess({ call, update }, payload: API_ACCESS.QueryAccess) {
      const res = await call(Service.getAccessList, payload, { paging: { key: 'accessListPaging' } });
      update({ accessList: res.list || [] });
      return res;
    },
    async createAccess({ call }, payload: API_ACCESS.CreateAccess) {
      const res = await call(Service.createAccess, payload, { successMsg: i18n.t('{action} successfully', { action: i18n.t('add') }) });
      return res;
    },
    async updateAccess({ call, getParams }, payload: API_ACCESS.CreateAccess) {
      const { accessID } = getParams();
      const res = await call(Service.updateAccess, { ...payload, accessID }, { successMsg: i18n.t('{action} successfully', { action: i18n.t('update') }) });
      return res;
    },
    async deleteAccess({ call }, payload: API_ACCESS.AccessID) {
      const res = await call(Service.deleteAccess, payload, { successMsg: i18n.t('{action} successfully', { action: i18n.t('delete') }) });
      return res;
    },
    async getAccessDetail({ call, update }, payload: API_ACCESS.AccessID) {
      const accessDetail = await call(Service.getAccessDetail, payload);
      update({ accessDetail });
      return accessDetail;
    },
    async getClient({ call, update }, payload: API_ACCESS.QueryClient) {
      const res = await call(Service.getClientList, payload, { paging: { key: 'clientPaging' } });
      update({ clientList: res.list || [] });
      return res;
    },
    async getApiGateway({ call, update }, payload: { projectID: number }) {
      const res = await call(Service.getApiGateway, payload);
      update({ apiGateways: res.list || [] });
      return res;
    },
    async getOperationRecord({ call, update }, payload: { clientID: number; contractID: number }) {
      const res = await call(Service.getOperationRecord, payload);
      update({ operationRecord: res.list || [] });
      return res;
    },
    async deleteContracts({ call }, payload: Omit<API_ACCESS.OperateContract, 'status'>) {
      const res = await call(Service.deleteContracts, payload, { successMsg: i18n.t('{action} successfully', { action: i18n.t('delete') }) });
      return res;
    },
    async updateContracts({ call }, payload: API_ACCESS.OperateContract) {
      const res = await call(Service.updateContracts, payload, { successMsg: i18n.t('{action} successfully', { action: i18n.t('update') }) });
      return res;
    },
    async getSlaList({ call, update }, payload: API_ACCESS.GetSlaList) {
      const res = await call(Service.getSlaList, payload);
      const slaList = res.list || [];
      const slaListMapper = {};
      slaList.forEach((sla) => {
        slaListMapper[sla.id] = sla;
      });

      update({ slaList, slaListMapper });
      return res;
    },
    async getSla({ call }, payload: API_ACCESS.GetSla) {
      const res = await call(Service.getSla, payload);
      return res;
    },
    async addSla({ call }, payload: API_ACCESS.AddSla) {
      const res = await call(Service.addSla, payload, { successMsg: i18n.t('{action} successfully', { action: i18n.t('add') }) });
      return res;
    },
    async updateSla({ call }, payload: API_ACCESS.UpdateSla) {
      const res = await call(Service.updateSla, payload, { successMsg: i18n.t('{action} successfully', { action: i18n.t('update') }) });
      return res;
    },
    async deleteSla({ call }, payload: API_ACCESS.DeleteSla) {
      const res = await call(Service.deleteSla, payload, { successMsg: i18n.t('{action} successfully', { action: i18n.t('delete') }) });
      return res;
    },
  },
  reducers: {
    clearAccess(state) {
      state.accessList = [];
      state.accessListPaging = getDefaultPaging();
    },
    clearOperationRecord(state) {
      state.operationRecord = [];
    },
    clearApiGateways(state) {
      state.apiGateways = [];
    },
    clearAccessDetail(state) {
      state.clientList = [];
      state.accessDetail = {
        access: {},
        tenantGroup: {},
        permission: {
          edit: false,
          delete: false,
        },
      } as API_ACCESS.AccessDetail;
    },
    clearSla(state) {
      state.slaList = [];
      state.slaListMapper = {};
    },
  },
});

export default apiAccess;
