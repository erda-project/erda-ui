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

/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { createStore } from '../cube';
import { isObject } from 'lodash';
import axios from 'axios';
import { Key, pathToRegexp, compile } from 'path-to-regexp';
import qs from 'query-string';
import { IUserInfo, setUserMap } from '../stores/user-map';
import { getConfig } from '../config';

const DEFAULT_PAGESIZE = 15;

/**
 * Fill in the actual value for the path with parameters by path-to-regexp
 * @param path Paths that may contain parameters, such as /fdp/:id/detail, path can not include `?`
 * @param params The incoming parameters may be query or params
 * @returns
 */
const generatePath = (path: string, params?: Obj) => {
  try {
    const toPathRepeated = compile(path);
    return toPathRepeated(params);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('path:', path, 'Error parsing url parameters');
    throw error;
  }
};

/**
 * Use path to match the incoming parameters, extract query and params
 * @param path Paths that may contain parameters, such as /fdp/:id/detail, path can not include `?`
 * @param params The incoming parameters may be query or params
 */
const extractPathParams = (path: string, params?: Obj<any>) => {
  const keys: Key[] = [];
  pathToRegexp(path, keys);
  const pathParams = {} as Obj<string>;
  const bodyOrQuery = { ...params };
  if (keys.length > 0) {
    keys.forEach(({ name }) => {
      pathParams[name] = bodyOrQuery[name];
      delete bodyOrQuery[name];
    });
  }
  return {
    pathParams,
    bodyOrQuery,
  };
};

interface $options {
  isDownload?: boolean; // whether its download api
  uploadFileKey?: string; // upload formData attribute
  autoMessage?: boolean; // eject message automatically
  successMsg?: string; // eject message when success to override default message
  errorMsg?: string; // eject message when failed to override default message
}
type $headers = Obj<string>;
type $body = Obj<unknown>;
interface CallParams {
  $options?: $options;
  $headers?: $headers;
  $body?: $body;
}

type Merge<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

/**
 * generate api request function by config
 * @param apiConfig
 * @returns callable api function
 */
export const genRequest = function <T extends FN>(apiConfig: APIConfig) {
  const { api, headers } = apiConfig;
  let [method, path] = api.split('@');
  if (!path) {
    path = method;
    method = 'get';
  }

  // use Merge to extract inner properties
  return (params: CallParams & Merge<Parameters<T>[0], {}>) => {
    const { $options, $headers, $body, ...rest } = params;
    const { bodyOrQuery, pathParams } = extractPathParams(path, rest);
    const { isDownload, uploadFileKey } = $options || {};
    if ('pageNo' in bodyOrQuery && !('pageSize' in bodyOrQuery)) {
      bodyOrQuery.pageSize = DEFAULT_PAGESIZE;
    }
    let bodyData;
    if (['post', 'put'].includes(method)) {
      if (Object.keys(bodyOrQuery).length) {
        bodyData = uploadFileKey ? bodyOrQuery[uploadFileKey] : bodyOrQuery;
      }
    } else if (method === 'delete') {
      bodyData = $body;
    }
    return axios({
      method: method as any,
      url: generatePath(path, pathParams),
      headers: headers ?? $headers,
      params: bodyOrQuery,
      paramsSerializer: (p: Obj<string>) => qs.stringify(p),
      responseType: isDownload ? 'blob' : 'json',
      data: bodyData,
    }).then((res) => res.data) as unknown as Promise<BODY<ReturnType<T>>>;
  };
};

export const apiDataStore = createStore({
  name: 'apiData',
  state: {
    body: {} as Obj,
    data: {} as Obj,
    loading: {} as Obj<boolean>,
  },
  reducers: {
    setBody(state, path: string, data: any) {
      state.body[path] = data;
    },
    setData(state, path: string, data: any) {
      state.data[path] = data;
    },
    setLoading(state, path: string, isLoading: boolean) {
      state.loading[path] = isLoading;
    },
  },
});

type FN = (...args: any) => any;
type NormalOrPagingData<D> = D extends PagingData ? Merge<D, ExtraPagingData> : D;
type RES<D> = Promise<BODY<D>>;
type PICK_DATA<T extends FN> = ReturnType<T> extends RES<infer D> ? NormalOrPagingData<D> : never;
type PICK_BODY<T extends FN> = BODY<PICK_DATA<T>>;
interface PagingData {
  list: any[];
  total: number;
  [k: string]: any;
}
interface ExtraPagingData {
  paging: {
    pageNo: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}
interface BODY<D> {
  data: NormalOrPagingData<D> | null;
  success: boolean;
  err: {
    msg: string;
    code: string;
    ctx: null | object;
  };
  userInfo?: Obj<IUserInfo>;
}
interface APIConfig {
  api: string;
  successMsg?: string;
  errorMsg?: string;
  globalKey?: string;
  headers?: Obj<string>;
}

const noop = (d: any) => {};
export function enhanceAPI<T extends FN>(apiFn: T, config?: APIConfig) {
  const { globalKey } = config || {};

  let _toggleLoading = noop;
  let _setData = noop;

  const onResponse = (body: PICK_BODY<T>, params: Parameters<T>[0]) => {
    // standard response
    if ('success' in body && 'err' in body) {
      const { data, success, err, userInfo } = body;
      if (userInfo) {
        setUserMap(userInfo);
      }

      if (isObject(data) && Object.keys(params).includes('pageNo')) {
        if ('list' in data && 'total' in data) {
          const { total } = data;
          const { pageNo, pageSize } = params;
          const hasMore = Math.ceil(total / +pageSize) > +pageNo;
          (data as any).paging = { pageNo, pageSize, total, hasMore };
        }
      }

      if (success) {
        const successMsg = params?.$options?.successMsg || config?.successMsg;
        successMsg && getConfig('onAPISuccess')?.(successMsg);
      } else if (err) {
        const errorMsg = err?.msg || params?.$options?.errorMsg || config?.errorMsg;
        errorMsg && getConfig('onAPIFail')?.('error', errorMsg);
      }
    }
  };

  const service = (params: Parameters<T>[0]): ReturnType<T> =>
    apiFn(params).then((body: PICK_BODY<T>) => {
      onResponse(body, params);
      return body;
    });

  return Object.assign(service, {
    fetch: (params: Parameters<T>[0]): ReturnType<T> => {
      _toggleLoading(true);
      return apiFn(params)
        .then((body: PICK_BODY<T>) => {
          onResponse(body, params);
          _setData(body?.data);
          return body;
        })
        .finally(() => {
          _toggleLoading(false);
        });
    },
    useData: (): PICK_DATA<T> | null => {
      const [data, setData] = React.useState(null);

      if (globalKey) {
        _setData = (d: PICK_DATA<T>) => apiDataStore.reducers.setData(globalKey, d);
        return apiDataStore.useStore((s) => s.data[globalKey]) as PICK_DATA<T>;
      }
      _setData = setData;

      return data;
    },
    useLoading: (): boolean => {
      const [loading, setLoading] = React.useState(false);

      if (globalKey) {
        _toggleLoading = (isLoading: boolean) => apiDataStore.reducers.setLoading(globalKey, isLoading);
        return apiDataStore.useStore((s) => !!s.loading[globalKey]);
      }
      _toggleLoading = setLoading;

      return loading;
    },
    useState: (): [PICK_DATA<T> | null, boolean] => {
      const [loading, setLoading] = React.useState(false);
      const [data, setData] = React.useState(null);

      if (globalKey) {
        _toggleLoading = (isLoading: boolean) => apiDataStore.reducers.setLoading(globalKey, isLoading);
        _setData = (d: PICK_DATA<T>) => apiDataStore.reducers.setData(globalKey, d);
        return apiDataStore.useStore((s) => [s.data[globalKey], !!s.loading[globalKey]]) as [PICK_DATA<T>, boolean];
      }
      _toggleLoading = setLoading;
      _setData = setData;

      return [data, loading];
    },
    getData: () => {
      return globalKey ? apiDataStore.getState((s) => s.data[globalKey]) : undefined;
    },
    clearData: () => {
      return globalKey ? apiDataStore.reducers.setData(globalKey, undefined) : undefined;
    },
  });
}

export function apiCreator<T extends FN>(apiConfig: APIConfig) {
  const apiFn = genRequest<T>(apiConfig);
  return enhanceAPI<typeof apiFn>(apiFn);
}

export { axios };
