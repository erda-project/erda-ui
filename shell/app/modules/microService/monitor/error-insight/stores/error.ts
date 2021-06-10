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
import { getErrorsList, getEventIds, getEventDetail } from '../services/errors';

interface IState {
  filters: Obj<string>;
  errors: {
    list: MONITOR_ERROR.IError[];
    offset: number;
    limit: number;
    total: number;
  };
  eventIds: string[];
  eventDetail: MONITOR_ERROR.IEventDetail;
}

const defaultErrors = {
  list: [],
  offset: 0,
  limit: 10,
  total: 0,
};

const initState: IState = {
  filters: {},
  errors: defaultErrors,
  eventIds: [],
  eventDetail: {} as MONITOR_ERROR.IEventDetail,
};

const error = createStore({
  name: 'monitorErrors',
  state: initState,
  effects: {
    async getErrorsList({ call, select, update, getParams }, payload: MONITOR_ERROR.IErrorQuery) {
      const { projectId } = getParams();
      const preErrors = select((s) => s.errors);
      const { offset } = preErrors;
      if (Number(offset) === -1) return; // offset-1表示当前往下无数据
      const errors = await call(getErrorsList, { ...payload, offset, projectId });
      if (errors) {
        error.reducers.getErrorsListSuccess({ errors, reqOffset: offset });
      } else {
        update({ errors: { ...preErrors, offset: -1 } });
      }
    },
    async getEventIds({ call, update, getParams }) {
      const { errorType, errorId, terminusKey } = getParams();
      const eventIds = await call(getEventIds, { id: errorId, errorType, terminusKey });
      update({ eventIds });
    },
    async getEventDetail({ call, update, getParams }, payload: { id: string }) {
      const { terminusKey } = getParams();
      const eventDetail = await call(getEventDetail, { ...payload, terminusKey });
      update({ eventDetail });
    },
  },
  reducers: {
    getErrorsListSuccess(
      state,
      payload: { errors: { errors: MONITOR_ERROR.IError[]; offset: number; total: number }; reqOffset: number },
    ) {
      const { errors, offset, total } = payload.errors;
      const oldList = state.errors.list;
      const list = `${payload.reqOffset}` === '0' ? errors : oldList.concat(errors);
      return { ...state, errors: { list, offset, total } };
    },
    clearMonitorErrors(state) {
      return { ...state, errors: defaultErrors };
    },
    setFilters(state, payload) {
      return { ...state, filters: payload };
    },
    clearFilters(state) {
      return { ...state, filters: {} };
    },
    clearEventDetail(state) {
      return { ...state, eventIds: [], eventDetail: {} };
    },
  },
});
export default error;
