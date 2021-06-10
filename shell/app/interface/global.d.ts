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

// no import or export statement in this file

declare module 'path';
declare module 'ansi_up';
declare module 'lodash/_stringToPath';

declare let If: React.FunctionComponent<{ condition: boolean }>;
declare let For: React.FunctionComponent<{ each: string; index: string; of: any[] }>;
declare let Choose: React.FunctionComponent;
declare let When: React.FunctionComponent<{ condition: boolean }>;
declare let Otherwise: React.FunctionComponent;

declare module '*.json' {
  const value: any;
  export default value;
}
declare module '*.scss' {
  const content: any;
  export default content;
}
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';

declare const mount: any;
declare const shallow: any;
declare const renderer: any;

// TODO: 如何追加类型定义？
// declare module CubeState {
//   export interface extendEffect<S> {
//     call<A, R>(fn: () => R, ...extra: any): Promise<R>;
//     // call<A, R>(fn: CalledFn<A, R>, payload: A, ...extra: any): Promise<R>;
//     // update(newState: Partial<S>): any;
//     // select<P>(selector: StateSelector<S, P>): P;
//     [k: string]: any;
//   }
// }

// 获得对象上某个属性的类型，比如 ValueOf<{ a: object }, 'a'> 得到object
type ValueOf<T extends Record<string, any>, K> = K extends keyof T ? T[K] : never;
// 把对象的属性类型拉平，比如 FlattenValues<{ a: string, b: number }>, 得到 string | number
type FlattenValues<T extends Record<string, any>> = T extends T ? T[keyof T] : never;

type Diff<T, U> = T extends U ? never : T; // Remove types from T that are assignable to U
// Names of properties in T with types that include undefined
type OptionalPropertyNames<T> = { [K in keyof T]: undefined extends T[K] ? K : never }[keyof T];

// Common properties from L and R with undefined in R[K] replaced by type in L[K]
type SpreadProperties<L, R, K extends keyof L & keyof R> = { [P in K]: L[P] | Diff<R[P], undefined> };

type Merge<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
// 互斥
type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

// Type of { ...L, ...R }
type Spread<L, R> =
  // Properties in L that don't exist in R
  Pick<L, Diff<keyof L, keyof R>> &
    // Properties in R with types that exclude undefined
    Pick<R, Diff<keyof R, OptionalPropertyNames<R>>> &
    // Properties in R, with types that include undefined, that don't exist in L
    Pick<R, Diff<OptionalPropertyNames<R>, keyof L>> &
    // Properties in R, with types that include undefined, that exist in L
    SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>;

// A中的所有属性都符合B中对应属性的类型，A中不存在而B中存在的以B的为准
type ShapeOf<A, B> = {
  [k in keyof A & keyof B]: A[k] extends B[k] ? A[k] : never;
} &
  {
    [k in keyof A]: A[k];
  };

interface Obj<T = any> {
  [k: string]: T;
}
type RefreshApiGateway = <T>(data: T) => void;

interface Window {
  _master: {
    registModule: (key: string, module: object) => void;
    getModule: (key: string) => object;
    insert: (key: string[] | string, requireVendorModules?: string[]) => void;
    stopLoadingModule: () => void;
    isLoadingModule: () => boolean;
    on: (type: string, cb: Function, clearInit: boolean) => Function;
    off: (type: string, cb: Function) => void;
    emit: (type: string, data: any) => void;
  };
  _modules: {
    [key: string]: object;
  };
  React: any;
  app: {
    _store: {
      getState: () => any;
      dispatch: (arg: { [k: string]: any; type: string; payload: any }) => any;
    };
  };
  diceEnv: {
    ENABLE_MPAAS: boolean;
    ENABLE_BIGDATA: boolean;
    ONLY_FDP: boolean;
    UC_PUBLIC_URL: string; // 包含protocol
  };
  refreshApiGateway: RefreshApiGateway | null;
  previewFun: (el: HTMLElement) => void;
  removeDom: (el: HTMLElement) => void;
}

interface IAction {
  [prop: string]: any;
  type: string;
  payload?: any;
}
interface IDispatch {
  (a: IAction): Promise<any>;
}

interface IPaging {
  total: number;
  pageNo: number;
  pageSize: number;
  hasMore?: boolean;
  // [prop: string]: any;
}

interface IPagingReq {
  pageSize: number;
  pageNo: number;
}

interface IPagingResp<T> {
  list: T[];
  total: number;
}

interface IScope {
  scope: string;
  scopeId: string | number;
}

interface IUploadFile {
  createdAt: string;
  creator: string;
  from: string;
  id: number;
  name: string;
  size: number;
  type: string;
  updatedAt: string;
  url: string;
  uuid: string;
}

interface IRoute {
  routeQuery: any;
  query: any;
  path: string;
  tabKey: string;
  tabs?: Array<{
    key: string;
    name: string;
  }>;
  perms: string[];
  _parent: IRoute;
  ignoreTabQuery?: boolean;
  keepTabQuery?: string[];
  alwaysShowTabKey?: string;
  // eslint-disable-next-line no-undef
  TabRightComp?: typeof React.Component;
  relativePath: string;
  connectToTab: (a: object[] | Function) => React.ComponentClass;
}

interface ITimeSpan {
  hours?: number;
  seconds?: number;
  endTime?: number;
  startTime?: number;
  endTimeMs: number;
  startTimeMs: number;
  endTimeNs?: number;
  startTimeNs?: number;
  time?: { startTime: number; endTime: number };
  timeMs?: { startTimeMs: number; endTimeMs: number };
  timeNs?: { startTimeNs: number; endTimeNs: number };
}

interface IAuthorize {
  key: string;
  targetId: string;
}

interface IAddon {
  addonName: string;
  appId: number;
  category: string;
  cluster: string;
  config: any;
  createdAt: string;
  consoleUrl: string;
  instanceId: string;
  logoUrl: string;
  name: string;
  orgId: number;
  plan: string;
  projectId: string;
  platformServiceType: number;
  realInstanceId: string;
  reference: number;
  runtimeId: number;
  shareScope: string;
  status: string;
  updatedAt: string;
  version: string;
  workspace: string;
  platform: boolean;
}

type WORKSPACE = 'DEV' | 'TEST' | 'STAGING' | 'PROD';

interface SocketMsg<T = any> {
  scope: {
    type: 'org' | 'project' | 'app';
    id: string;
  };
  type: string;
  payload: T;
}

interface IChartSeries {
  unitType: string;
  unit: string;
  data: number[];
  chartType: string;
  name: string;
  tag: string;
  axisIndex: 0 | 1;
}

interface IChartResult {
  time: number[];
  results: Array<{
    name: string;
    data: Array<Obj<IChartSeries>>;
  }>;
}

interface IChartQuery {
  [pro: string]: any;
  start: number;
  end: number;
  group?: string | string[];
  limit?: number;
  points?: number;
}

interface FilterItemConfig {
  [prop: string]: any;
  required?: boolean;
  validator?: any[];
  type: Function;
  collapseRender?: (props: any, value: any) => string | string[];
  format?: (props: any, value: any) => any;
  customProps?: Obj;
  label?: string;
  name: string;
  customTransformer?: (value: any, allQuery?: any) => any;
  valueType?: string;
}
