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

declare namespace TOPOLOGY {
  interface ITopologyQuery {
    startTime: number;
    endTime: number;
    terminusKey: string;
    tags: string[];
  }

  interface IParent {
    id: string;
    name: string;
    metric?: {
      count: number;
      lineCount: number;
      mqCount: boolean;
      rt: number;
    };
  }

  interface IGroup {
    category: string;
    id: string;
    name: string;
    parents: IParent[];
  }

  interface INode {
    applicationId: string;
    applicationName: string;
    group: string;
    id: string;
    dashboardId: string;
    metric: {
      rt: number;
      count: number;
      http_error: number;
      error_rate: number;
      running: number;
      stopped: number;
    };
    name: string;
    parents: IParent[];
    runtimeId: string;
    runtimeName: string;
    serviceMesh: string;
    serviceName: string;
    serviceId: string;
    type: string;
  }

  interface ITopologyResp {
    nodes: INode[];
  }

  interface IErrorDetailQuery {
    align: boolean;
    end: number;
    field_gte_http_status_code_min: number;
    filter_error: boolean;
    filter_target_application_id: string;
    filter_target_runtime_name: string;
    filter_target_service_name: string;
    filter_target_terminus_key: string;
    start: number;
    sum: string;
  }

  interface IExceptionQuery {
    sum: string;
    align: boolean;
    start: number;
    end: number;
    filter_terminus_key: string;
    filter_runtime_name: string;
    filter_service_name: string;
    filter_application_id: number;
  }

  interface ILink {
    source: string;
    target: string;
    hasReverse?: boolean;
  }

  interface INodeParent {
    id: string;
  }

  interface IConfig {
    direction: string; // ????????????: vertical | horizontal
    NODE: {
      width: number; // ?????????
      height: number; // ?????????
      margin: {
        x: number; // ??????????????????
        y: number; // ??????????????????
      };
    };
    LINK: {
      linkDis: number; // ??????????????????
    };
    padding: {
      // ??????????????????padding
      x: number;
      y: number;
    };
    groupPadding: {
      x: number;
      y: number;
    };
    boxMargin: {
      x: number;
      y: number;
    };
    svgAttr: {
      polyline: object;
      polylineFade: object;
    };
    showBox: boolean; // ??????????????????box
  }

  interface ILinkRender {
    links: ILink[];
    nodeMap: object;
    boxHeight?: number;
    groupDeepth?: any;
  }

  interface ICircuitBreakerBase {
    id: string;
    type: string;
    maxConnections: string; // ???????????????
    maxRetries: string; // ??????????????????
    consecutiveErrors: string; // ?????????????????????
    interval: string; // ???????????????????????????????????????
    baseEjectionTime: string; // ??????????????????????????????
    maxEjectionPercent: string; // ??????????????????
    enable: boolean; // ????????????
  }
  interface ICircuitBreakerHttp extends ICircuitBreakerBase {
    maxPendingRequests: string; // ?????????????????????
  }

  interface ICircuitBreakerDubbo extends ICircuitBreakerBase {
    interfaceName: string; // ????????????
  }

  interface ICircuitBreaker {
    http: ICircuitBreakerHttp;
    dubbo: ICircuitBreakerDubbo[];
  }

  interface IFaultInjectHttp {
    id: string;
    type: string;
    path: string; // ????????????
    fixedDelay: string; // ????????????
    delayPercentage: string; // ????????????
    abortStatus: string; // ?????????
    abortPercentage: string; // ????????????
    enable: boolean; // ???????????????true????????????false?????????
  }

  interface IFaultInjectDubbo {
    id: string;
    type: string;
    interfaceName: string; // ????????????
    fixedDelay: string; // ????????????
    delayPercentage: string; // ????????????
    enable: boolean; // ???????????????true????????????false?????????
  }

  interface IFaultInject {
    http: IFaultInjectHttp[];
    dubbo: IFaultInjectDubbo[];
  }

  interface IQuery {
    projectId: string; // ??????id
    env: string; // ??????
    tenantGroup: string; // ?????????
  }
  interface IServiceMeshQuery extends IQuery {
    runtimeId: string;
    runtimeName: string;
    applicationId: string;
    serverName: string;
    hideNoRule: string;
  }

  interface ICircuitBreakerSave extends IQuery {
    data: ICircuitBreakerHttp | ICircuitBreakerDubbo;
    query: IServiceMeshQuery;
  }

  interface IFaultInjectSave extends IQuery {
    data: IFaultInjectHttp | IFaultInjectDubbo;
    query: IServiceMeshQuery;
  }

  interface IFaultInjectDelete extends IQuery, IServiceMeshQuery {
    id: string;
  }

  interface ITopologyTagsQuery {
    terminusKey: string;
  }

  interface ISingleTopologyTags {
    tag: string;
    label: string;
    type: string;
  }

  interface ITopologyTagOptionQuery {
    startTime: number;
    endTime: number;
    terminusKey: string;
    tag: string;
  }
}
