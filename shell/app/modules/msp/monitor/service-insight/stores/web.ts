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
import { get } from 'lodash';
import { getSubSlowHttpList, getSubErrorHttpList, getSubSlowRPCList } from '../services';

interface IState {
  subSlowHttpList: Obj<MONITOR_SI.ITableData[]>;
  subSlowRPCList: Obj<MONITOR_SI.ITableData[]>;
  subErrorHttpList: Obj<MONITOR_SI.ITableData[]>;
}

const initState: IState = {
  subSlowHttpList: {},
  subSlowRPCList: {},
  subErrorHttpList: {},
};

const siWebStore = createStore({
  name: 'SIWeb',
  state: initState,
  effects: {
    async getSubSlowHttpList({ call, update }, payload: MONITOR_SI.ITableDataQuery) {
      const subSlowHttpList = siWebStore.getState((s) => s.subSlowHttpList);
      const { filter_http_path } = payload;
      const data = await call(getSubSlowHttpList, { ...payload, filter_trace_sampled: true });
      update({ subSlowHttpList: { ...subSlowHttpList, [filter_http_path]: get(data, 'results[0].data') || [] } });
    },
    async getSubSlowRPCList({ call, update }, payload: MONITOR_SI.ITableDataQuery) {
      const subSlowRPCList = siWebStore.getState((s) => s.subSlowRPCList);
      const { filter_dubbo_service } = payload;
      const data = await call(getSubSlowRPCList, { ...payload, filter_trace_sampled: true });
      update({ subSlowRPCList: { ...subSlowRPCList, [filter_dubbo_service]: get(data, 'results[0].data') || [] } });
    },
    async getSubErrorHttpList({ call, update }, payload: MONITOR_SI.ITableDataQuery) {
      const subErrorHttpList = siWebStore.getState((s) => s.subErrorHttpList) as any;
      const { filter_http_path, filter_http_status_code } = payload;
      const errorKey = `${filter_http_path}_${filter_http_status_code}`;
      const data = await call(getSubErrorHttpList, payload);
      update({ subErrorHttpList: { ...subErrorHttpList, [errorKey]: get(data, 'results[0].data') || [] } });
    },
  },
});

export default siWebStore;
