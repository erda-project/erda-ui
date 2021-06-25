/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { createStore } from '../cube';
import { isEmpty } from 'lodash';
import axios from 'axios';
import { Key, pathToRegexp, compile } from 'path-to-regexp';
import qs from 'query-string';
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
const extractPathParams = (path: string, params?: Record<string, any>) => {
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
type $headers = Record<string, string>;
type $body = Record<string, any>;
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

  return (params: CallParams & Merge<Parameters<T>[0], {}>) => {
    const { $options, $headers, $body, ...rest } = params;
    const { bodyOrQuery, pathParams } = extractPathParams(path, rest);
    const { isDownload, uploadFileKey } = $options || {};
    if ('pageNo' in bodyOrQuery && !('pageSize' in bodyOrQuery)) {
      bodyOrQuery.pageSize = DEFAULT_PAGESIZE;
    }
    let bodyData;
    if (['post', 'put'].includes(method)) {
      bodyData = isEmpty(bodyOrQuery) ? undefined : uploadFileKey ? bodyOrQuery[uploadFileKey] : bodyOrQuery;
    } else if (method === 'delete') {
      bodyData = $body;
    }
    return axios({
      method: method as any,
      url: generatePath(path, pathParams),
      headers: !isEmpty(headers) ? headers : $headers,
      params: bodyOrQuery,
      paramsSerializer: (p: Record<string, string>) => qs.stringify(p),
      responseType: isDownload ? 'blob' : 'json',
      data: bodyData,
    }).then((res) => res.data) as unknown as Promise<BODY<ReturnType<T>>>;
  };
};

export const apiDataStore = createStore({
  name: 'api_data',
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
type RES<D> = Promise<BODY<D>>;
type PICK_BODY<T extends FN> = ReturnType<T> extends RES<infer D> ? BODY<D> : never;
type PICK_DATA<T extends FN> = ReturnType<T> extends RES<infer D> ? D : never;
interface APIConfig {
  api: string;
  successMsg?: string;
  errorMsg?: string;
  paging?: any;
  globalKey?: string;
  headers?: Record<string, any>;
}
interface BODY<D> {
  data: D | null;
  success: boolean;
  err: {
    msg: string;
    code: string;
    ctx: null | object;
  };
  userInfo?: Record<string, object>;
}

const noop = (d: any) => {};
export function enhanceAPI<T extends FN>(apiFn: T, config?: APIConfig) {
  const { globalKey } = config || { paging: {} };

  let _toggleLoading = noop;
  let _setData = noop;

  const service = (params: Parameters<T>[0]): ReturnType<T> =>
    apiFn(params).then((body: PICK_BODY<T>) => {
      return (getConfig('onResponse') || noop)(body, params, config);
    });

  return Object.assign(service, {
    fetch: (params: Parameters<T>[0]): ReturnType<T> => {
      _toggleLoading(true);
      return apiFn(params)
        .then((body: PICK_BODY<T>) => {
          // standard response
          if (body === null || ('success' in body && 'err' in body)) {
            _setData(body.data);
          }
          (getConfig('onResponse') || noop)(body, params, config);
          return body;
        })
        .finally(() => {
          _toggleLoading(false);
        });
    },
    useData: (): PICK_DATA<T> | null => {
      const [data, setData] = React.useState(null);

      if (globalKey) {
        _setData = (d: any) => apiDataStore.reducers.setData(globalKey, d);
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
        _setData = (d: any) => apiDataStore.reducers.setData(globalKey, d);
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
