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

declare namespace MONITOR_TRACE {

  interface ITraceRequestResp {
    limit: number;
    offset: number;
    total: number;
    history: IHistory[];
  }

  interface IHistory {
    body: string;
    createTime: string;
    header: Obj<string>;
    method: string;
    query: Obj<string>;
    requestId: string;
    responseBody: string;
    responseCode: number;
    status: number;
    statusName: string;
    terminusKey: string;
    updateTime: string;
    url: string;
  }

  interface ITraceRequestBody{
    createTime: string;
    requestId: string;
    status: number;
    statusName: string;
    updateTime: string;
  }

  interface IStatus {
    requestId: string;
    status: number;
    statusName: string;
    terminusKey: string;
  }

  interface ITrace {
    annotations: any[];
    binaryAnnotations: IAnnotations[];
    duration: number;
    endTime: number;
    id: string;
    name: string;
    parentSpanId: string;
    startTime: number;
    timestamp: number;
    traceId: string;
  }

  interface IAnnotations {
    endpoint: {
      name: string;
      serviceName: string;
    };
    key: string;
    value: string;
  }

  interface ITraceDetail {
    depth: number;
    duration: string;
    serviceCounts: Array<{name: string; count: number; max: number}>;
    services: number;
    spans: ISpan[];
    spansBackup: ISpan[];
    timeMarkers: Array<{index: number; time: string}>;
    timeMarkersBackup: Array<{index: number; time: string}>;
    totalSpans: number;
    traceId: string;
  }

  interface ISpan {
    annotations: any[];
    binaryAnnotations: IAnnotations[];
    children: string;
    depth: number;
    depthClass: number;
    duration: number;
    durationStr: string;
    errorType: string;
    isExpand: boolean;
    isShow: boolean;
    left: number;
    parentId: string;
    serviceName: string;
    serviceNames: string;
    spanId: string;
    spanName: string;
    width: number;
  }

}
