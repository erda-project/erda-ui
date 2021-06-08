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

import { createFlatStore } from 'app/cube';
import { isEmpty } from 'lodash';
import traceToMustache from 'microService/monitor/trace-insight/common/utils/traceDetail';
import { getTraceCount, getTraceSummary, getSpanDetailContent, getTraceDetailContent } from '../services/trace';

interface IState {
  traceCount: any;
  traceSummary: MS_MONITOR.ITraceSummary[];
  spanDetailContent: any;
  traceDetailContent: any;
}

const initState: IState = {
  traceCount: {} as any,
  traceSummary: [],
  spanDetailContent: {
    visible: false,
    span: {},
  } as any,
  traceDetailContent: {} as any,
};

const transformTrace = (trace: any) => {
  if (isEmpty(trace)) return {};
  const traceDetail = traceToMustache(trace);
  traceDetail.spans.forEach((i: any) => {
    // eslint-disable-next-line
    i.isExpand = i.isShow = true;
  });
  return traceDetail;
};

const trace = createFlatStore({
  name: 'monitorTraceStore',
  state: initState,
  effects: {
    async getTraceCount({ call, update, getParams }, payload: {
      start?: number;
      end?: number;
      'filter_fields.applications_ids'?: number;
      'filter_fields.services_distinct'?: string;
      field_gt_errors_sum?: number;
      field_eq_errors_sum?: number;
    }) {
      const { terminusKey } = getParams();
      const traceCount = await call(getTraceCount, {
        cardinality: 'tags.trace_id',
        align: false,
        'filter_fields.terminus_keys': terminusKey,
        ...payload,
      });
      update({ traceCount });
    },
    async getTraceSummary({ call, update, getParams }, payload: MS_MONITOR.ITraceSummaryQuery) {
      const { terminusKey } = getParams();
      const traceSummary = await call(getTraceSummary, { terminusKey, ...payload });
      update({ traceSummary });
    },
    async getSpanDetailContent({ call, update }, payload: any) {
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
    async getTraceDetailContent({ call, update, getParams }, payload: any) {
      const { terminusKey } = getParams();
      const response = await call(getTraceDetailContent, { ...payload, terminusKey });
      // 接口返回timestamp为毫秒，duration为微秒，统一为微秒
      const traceList = response.map((item: any) => {
        const annotations = item.annotations || [];
        return {
          ...item,
          timestamp: item.timestamp * 1000,
          annotations: annotations.map((annotation: any) => {
            return { ...annotation, timestamp: annotation.timestamp * 1000 };
          }),
        };
      });
      const content = transformTrace(traceList);
      update({ traceDetailContent: content });
      return content;
    },
  },
});

export default trace;
