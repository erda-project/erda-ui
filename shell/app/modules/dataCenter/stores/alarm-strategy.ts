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
import { forEach } from 'lodash';
import { getAlerts, getAlertDetail, createAlert, editAlert, getAlertTypes, toggleAlert, deleteAlert, getClusterList } from '../services/alarm-strategy';
import userStore from 'app/user/stores';
import i18n from 'i18n';
import { PAGINATION } from 'app/constants';
import orgStore from 'app/org-home/stores/org';

interface IState {
  alertTypes: COMMON_STRATEGY_NOTIFY.IAlertType;
  alertList: COMMON_STRATEGY_NOTIFY.IAlert[];
  alarmPaging: IPaging;
  alarmScopeMap: { [key: string]: string } | {};
}

const defaultPaging = {
  pageNo: 1,
  pageSize: PAGINATION.pageSize,
  total: 0,
};

const initOrgState: IState = {
  alertTypes: {} as COMMON_STRATEGY_NOTIFY.IAlertType,
  alarmScopeMap: {},
  alertList: [],
  alarmPaging: defaultPaging,
};

const alarmStrategy = createStore({
  name: 'dataCenterAlarmStrategy',
  state: initOrgState,
  effects: {
    async getAlerts({ call, update }, payload?: COMMON_STRATEGY_NOTIFY.IPageParam) {
      const { list } = await call(getAlerts, payload, { paging: { key: 'alarmPaging' } });
      update({ alertList: list });
    },
    async getAlertDetail({ call }, id: number) {
      const alertDetail = await call(getAlertDetail, id);
      return alertDetail;
    },
    async createAlert({ call }, payload: COMMON_STRATEGY_NOTIFY.IAlertBody) {
      await call(createAlert, payload, { successMsg: i18n.t('operated successfully') });
      await alarmStrategy.effects.getAlerts({ pageNo: 1 });
    },
    async editAlert({ call }, payload: { body: COMMON_STRATEGY_NOTIFY.IAlertBody; id: string; }) {
      await call(editAlert, payload, { successMsg: i18n.t('operated successfully') });
      await alarmStrategy.effects.getAlerts({ pageNo: 1 });
    },
    async getAlertTypes({ call, update }) {
      const alertTypes = await call(getAlertTypes, 'org');
      update({ alertTypes });
    },
    async toggleAlert({ call }, { id, enable }) {
      await call(toggleAlert, { id, enable });
    },
    async deleteAlert({ call }, id: number) {
      await call(deleteAlert, id, { successMsg: i18n.t('operated successfully') });
      await alarmStrategy.effects.getAlerts({ pageNo: 1 });
    },
    async getAlarmScopes({ call, update }) {
      const orgId = orgStore.getState(s => s.currentOrg.id);
      const orgClusterList = await call(getClusterList, { orgId });
      const alarmScopeMap = {};
      forEach(orgClusterList, ({ name }) => {
        alarmScopeMap[name] = name;
      });
      update({ alarmScopeMap });
    },
  },
  reducers: {
    clearAlerts(state) {
      state.alertList = [];
    },
  },
});

export default alarmStrategy;
