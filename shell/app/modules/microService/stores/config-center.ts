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

import * as ConfigCenterService from '../services/configCenter';
import i18n from 'i18n';
import { createStore } from 'app/cube';

interface IState {
  appList: string[];
  appListPaging: IPaging;
  configListMap: Record<string, any>;
}

const initState: IState = {
  appList: [],
  appListPaging: {} as IPaging,
  configListMap: {},
};

const ConfigCenter = createStore({
  name: 'configCenter',
  state: initState,
  effects: {
    async getAppList({ call }, payload: ConfogCenter.GetAppList) {
      const res = await call(ConfigCenterService.getAppList, payload, { paging: { key: 'appListPaging' } });
      if (!res) {
        return { total: 0, list: [] };
      }
      const { total, list } = res;
      ConfigCenter.reducers.getAppListSuccess({ ...payload, list });
      return { total, list };
    },
    async getConfigList({ call }, payload: ConfogCenter.GetConfigList) {
      const data = await call(ConfigCenterService.getConfigList, payload);
      if (data) {
        ConfigCenter.reducers.getConfigListSuccess({ ...payload, data });
      }
    },
    async saveConfig({ call }, payload: ConfogCenter.SaveConfig) {
      const { operationType, ...rest } = payload;
      const res = await call(ConfigCenterService.saveConfig, rest, { successMsg: operationType === 'delete' ? i18n.t('deleted successfully') : i18n.t('save successfully'), fullResult: true });
      return res;
    },
  },
  reducers: {
    getAppListSuccess(state, payload) {
      const { pageNo, list } = payload;
      const prevList = state.appList;
      const newList = pageNo === 1 ? [...list] : [...prevList, ...list];
      state.appList = newList;
    },
    getConfigListSuccess(state, payload) {
      const { data = {}, groupId } = payload;
      return { ...state, configListMap: { ...state.configListMap, [groupId]: data[groupId] || [] } };
    },
    clearConfigListMap(state) {
      state.configListMap = {};
    },
    clearAppList(state) {
      state.appList = [];
      state.appListPaging = {} as IPaging;
    },
  },
});
export default ConfigCenter;
