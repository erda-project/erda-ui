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
import { getSubSlowDbList, getSubErrorDbList } from '../services';
import { get } from 'lodash';

interface IState {
  subSlowDbList: Obj<MONITOR_SI.ITableData[]>;
  subErrorDbList: Obj<MONITOR_SI.ITableData[]>;
}
const initState: IState = {
  subSlowDbList: {},
  subErrorDbList: {},
};

const Database = createStore({
  name: 'SIDataBase',
  state: initState,
  effects: {
    async getSubSlowDbList({ call, update }, payload: MONITOR_SI.ITableDataQuery) {
      const subSlowDbList = Database.getState((s) => s.subSlowDbList) as any;
      const { filter_db_statement } = payload;
      const data = await call(getSubSlowDbList, { ...payload, filter_trace_sampled: true });
      update({ subSlowDbList: { ...subSlowDbList, [filter_db_statement]: get(data, 'results[0].data') || [] } });
    },
    async getSubErrorDbList({ call, update }, payload: MONITOR_SI.ITableDataQuery) {
      const subErrorDbList = Database.getState((s) => s.subErrorDbList) as any;
      const { filter_db_statement } = payload;
      const data = await call(getSubErrorDbList, payload);
      update({ subErrorDbList: { ...subErrorDbList, [filter_db_statement]: get(data, 'results[0].data') || [] } });
    },
  },
});
export default Database;
