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

import {
  getTraceHistoryList,
  requestTrace,
  getTraceDetail,
  getTraceStatus,
  cancelTraceStatus,
  getTraceDetailContent,
  getSpanDetailContent,
} from '../services/trace-querier';
import { isEmpty } from 'lodash';
import traceToMustache from '../common/utils/traceDetail';
import { createStore } from 'app/cube';

import i18n from 'i18n';

const transformTrace = (trace: MONITOR_TRACE.ITrace[]) => {
  if (isEmpty(trace)) return {};
  const traceDetail = traceToMustache(trace);
  traceDetail.spans.forEach((i) => {
    // eslint-disable-next-line
    i.isExpand = i.isShow = true;
  });
  return traceDetail;
};

interface IParams {
  method: string;
  url: string;
  body: string;
  query: Obj<string>;
  header: Obj<string>;
  responseCode?: number;
}

interface IState {
  requestTraceParams: IParams;
  currentTraceRequestId: string;
  traceHistoryList: MONITOR_TRACE.IHistory[];
  traceStatusList: MONITOR_TRACE.IStatus[];
  traceStatusDetail: MONITOR_TRACE.IStatus | {};
  traceDetailContent: MONITOR_TRACE.ITraceDetail | {};
  spanDetailContent: {
    visible: boolean;
    span: any;
  };
  traceStatusListPaging: {
    page: number;
    size: number;
    total: number;
  };
}

const DEFAULT_REQUEST_PARAMS = {
  method: 'GET',
  url: '',
  body: '',
  query: {},
  header: {},
};

const initState: IState = {
  requestTraceParams: DEFAULT_REQUEST_PARAMS,
  currentTraceRequestId: '',
  traceHistoryList: [],
  traceStatusList: [],
  traceStatusDetail: {},
  traceDetailContent: {},
  spanDetailContent: {
    visible: false,
    span: {},
  },
  traceStatusListPaging: {
    page: 1,
    size: 10,
    total: 0,
  },
};

const traceQuerier = createStore({
  name: 'traceQuerier',
  state: initState,
  effects: {
    async getTraceHistoryList({ call, update, getParams }) {
      const { terminusKey } = getParams();
      const { history: traceHistoryList } = await call(getTraceHistoryList, { terminusKey });
      update({ traceHistoryList });
    },
    async requestTrace({ select, call, getParams }, payload?: MONITOR_TRACE.ITraceRequestBody) {
      const { terminusKey, projectId } = getParams();
      const requestTraceParams = select((s) => s.requestTraceParams);
      const { requestId: currentTraceRequestId } = await call(requestTrace, {
        ...requestTraceParams,
        ...(payload || {}),
        terminusKey,
        projectId,
      });
      traceQuerier.reducers.setCurrentTraceRequestId(currentTraceRequestId);
      await traceQuerier.effects.getTraceHistoryList();
      await traceQuerier.effects.getTraceDetail({ requestId: currentTraceRequestId });
      await traceQuerier.effects.getTraceStatusDetail({ requestId: currentTraceRequestId });
    },
    async getTraceDetail({ call }, payload: { requestId: string }) {
      const { method, url, body, query, header, ...rest } = await call(getTraceDetail, payload);
      traceQuerier.reducers.setRequestTraceParams({
        method: method || 'GET',
        url: url || '',
        body: body || '',
        query: query || {},
        header: header || {},
        ...rest,
      });
    },
    async getTraceStatusDetail({ select, call, update }, payload: { requestId: string }) {
      const currentTraceRequestId = select((s) => s.currentTraceRequestId);
      if (currentTraceRequestId !== payload.requestId) return;

      const traceStatusDetail = await call(getTraceStatus, payload);
      update({ traceStatusDetail });
      if (traceStatusDetail.status === 0) {
        const delay = (ms: number) =>
          new Promise((resolve) => {
            setTimeout(resolve, ms);
          });
        await call(delay, 5000);
        await traceQuerier.effects.getTraceStatusDetail({ requestId: payload.requestId });
      }
      if (traceStatusDetail.status === 1) {
        await traceQuerier.effects.getTraceDetailContent({ requestId: payload.requestId });
      }
    },
    async cancelTraceStatus({ select, call }, payload: { requestId: string }) {
      const currentTraceRequestId = select((s) => s.currentTraceRequestId);
      await call(cancelTraceStatus, payload, {
        successMsg: i18n.t('microService:cancelled successfully'),
        errorMsg: i18n.t('microService:Failed to cancel. Please try again late.'),
      });

      await traceQuerier.effects.getTraceStatusDetail({ requestId: currentTraceRequestId });
    },
    async getTraceDetailContent({ call, update, getParams }, payload: { requestId: string; needReturn?: boolean }) {
      const { terminusKey } = getParams();
      const response = await call(getTraceDetailContent, { ...payload, terminusKey });
      // 接口返回timestamp为毫秒，duration为微秒，统一为微秒
      const traceList = response.map((item) => {
        const annotations = item.annotations || [];
        return {
          ...item,
          timestamp: item.timestamp * 1000,
          annotations: annotations.map((annotation) => {
            return { ...annotation, timestamp: annotation.timestamp * 1000 };
          }),
        };
      });
      const content = transformTrace(traceList);
      const { needReturn } = payload;
      if (needReturn) {
        return content;
      }
      update({ traceDetailContent: content });
    },
    async getSpanDetailContent({ call, update }, payload: { span: any; visible: boolean }) {
      const response = await call(getSpanDetailContent, payload);
      const annotations = response.span.annotations || [];
      // 接口返回timestamp为毫秒，duration为微秒，统一为微秒
      const spanDetailContent = {
        ...response,
        annotations: annotations.map((item: any) => {
          return { ...item, timestamp: item.timestamp * 1000 };
        }),
      };
      update({ spanDetailContent });
    },
  },
  reducers: {
    setRequestTraceParams(state, payload: IParams) {
      state.requestTraceParams = payload;
    },
    setCurrentTraceRequestId(state, payload: string) {
      state.currentTraceRequestId = payload;
    },
    setTraceStatusListPaging(state, payload: { page?: number; size?: number; total?: number }) {
      state.traceStatusListPaging = {
        ...state.traceStatusListPaging,
        ...payload,
      };
    },
    clearRequestTraceParams(state) {
      state.requestTraceParams = DEFAULT_REQUEST_PARAMS;
    },
    clearCurrentTraceRequestId(state) {
      state.currentTraceRequestId = '';
    },
    clearTraceStatusDetail(state) {
      state.traceStatusDetail = {};
    },
  },
});

export default traceQuerier;
