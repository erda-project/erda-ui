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

import { set, get, isEmpty } from 'lodash';
import { axios } from 'core/service';

import qs from 'query-string';
import { extractPathParams, generatePath, notify } from './index';
import { serviceLoadingStore as loadingStore } from 'common/stores/loading';
import userStore from 'common/stores/user-map';
import i18n from 'i18n';
import { PAGINATION } from 'app/constants';

export interface CallParams {
  $options?: {
    isDownload?: boolean; // whether its download api
    uploadFileKey?: string; // upload formData attribute
    autoMessage?: boolean; // eject message automatically
    successMsg?: string; // eject message when success to override default message
    errorMsg?: string; // eject message when failed to override default message
  };
  $headers?: {
    [k: string]: string; // custom header
  };
  $body?: {
    [k: string]: Obj; // only used for pass body when delete method
  };
  $entireRes?: boolean; // whether return entire response to caller
}

type CallType = CallParams & {
  [k: string]: string;
};

const METHODS = ['get', 'post', 'put', 'delete'];

// extract api http method
const extractMethod = (apiName: string) => {
  const regexResult = /[a-z]+/.exec(apiName);
  const method = get(regexResult, 0);
  return METHODS.includes(method || '') ? method : 'get';
};

/**
 * fetch call HOC, handle loading/message popup/return data format/user store setup etc.
 * @param ns name space, comprehend as service collection name
 * @param serviceName service name
 * @param serviceFunc actual service call by axios
 * @returns service result
 */
const fetchHoc =
  (ns: string, serviceName: string, serviceFunc: (params: CallType) => Promise<RAW_RESPONSE>) =>
  async (params?: CallType) => {
    const processRequest = async () => {
      const { $entireRes, ...rest } = params || {};
      const { $options } = rest;
      // loading start
      loadingStore.reducers.setServiceLoading(ns, serviceName, true);

      try {
        const data = await serviceFunc(rest);
        // loading end
        loadingStore.reducers.setServiceLoading(ns, serviceName, false);
        if ('success' in data || 'err' in data) {
          const { success, err, userInfo } = data;
          if (userStore && userInfo) {
            userStore.reducers.setUserMap(userInfo);
          }
          if (success) {
            $options && $options.successMsg && notify('success', $options.successMsg);
          } else if (err) {
            notify('error', $options?.errorMsg || err?.msg);
            return data?.data;
          }
        }
        const method = extractMethod(serviceName);
        return $entireRes || method !== 'get' ? data : data?.data;
      } catch (error) {
        loadingStore.reducers.setServiceLoading(ns, serviceName, false);
        throw error;
      }
    };
    return await processRequest();
  };

export type PromiseWrap<T extends { [k: string]: (params?: any) => any }> = {
  [K in keyof T]: Parameters<T[K]>[0] extends undefined
    ? (params?: CallParams) => Promise<ReturnType<T[K]>>
    : (params: Parameters<T[K]>[0] & Partial<CallParams>) => Promise<ReturnType<T[K]>>;
};

/**
 * transform plain apisInput into callable api functions
 * @param apisInput apis structure like { 'getAppList': '/api/xxx/xxx' }
 * @param ns name space, comprehend as service collection name
 * @param headers predefined headers
 * @returns callable api structure like { 'getAppList': (params: T) => Promise<K> }
 */
export const apiCreator = function <T extends { [k: string]: (params?: any) => any }>(
  apisInput: Kv<T>,
  ns: string,
  headers?: { [k: string]: string },
): PromiseWrap<T> {
  const apis = {} as unknown as T;
  Object.keys(apisInput).forEach((apiName) => {
    const method = extractMethod(apiName);
    switch (method) {
      case 'get':
        {
          const getCall = async (params: CallType) => {
            const { $options = {}, $headers, ...rest } = params || {};
            const { bodyOrQuery, pathParams } = extractPathParams(apisInput[apiName], rest);
            const { isDownload } = $options;
            if ('pageNo' in bodyOrQuery && !('pageSize' in bodyOrQuery)) {
              bodyOrQuery.pageSize = PAGINATION.pageSize;
            }
            const { data } = await axios.get(generatePath(apisInput[apiName], pathParams), {
              headers: headers || $headers,
              params: bodyOrQuery,
              paramsSerializer: (p) => qs.stringify(p),
              responseType: isDownload ? 'blob' : 'json',
            });
            if (params && 'pageNo' in params) {
              // it's a paging api, generate paging obj automatically
              const { data: result } = data;
              const { total } = result;
              const { pageNo, pageSize = PAGINATION.pageSize } = params;
              const hasMore = Math.ceil(total / +pageSize) > +pageNo;
              result.paging = { pageNo, pageSize, total, hasMore };
              result.list = result.list || result.data;
            }
            return data;
          };
          set(apis, apiName, fetchHoc(ns, apiName, getCall));
        }
        break;
      case 'post':
      case 'put':
        {
          const postCall = async (params: CallType) => {
            const { $options = {}, $headers, ...rest } = params || {};
            const { bodyOrQuery, pathParams } = extractPathParams(apisInput[apiName], rest);
            const { uploadFileKey, autoMessage } = $options;
            const config = {
              headers: headers || $headers,
            };
            const url = generatePath(apisInput[apiName], pathParams);
            const { data } = await axios[method](
              url,
              isEmpty(bodyOrQuery) ? undefined : uploadFileKey ? bodyOrQuery[uploadFileKey] : bodyOrQuery,
              config,
            );
            if (autoMessage && data && data.success) {
              notify('success', method === 'post' ? i18n.t('created successfully') : i18n.t('update successfully'));
            }
            return data;
          };
          set(apis, apiName, fetchHoc(ns, apiName, postCall));
        }
        break;
      case 'delete':
        {
          const deleteCall = async (params: CallType) => {
            const { $options = {}, $headers, $body, ...rest } = params || {};
            const { bodyOrQuery, pathParams } = extractPathParams(apisInput[apiName], rest);
            const { autoMessage } = $options;
            const { data } = await axios.delete(generatePath(apisInput[apiName], pathParams), {
              headers: headers || $headers,
              data: $body,
              params: bodyOrQuery,
              paramsSerializer: (p) => qs.stringify(p),
            });
            if (autoMessage && data && data.success) {
              notify('success', i18n.t('delete successfully'));
            }
            return data;
          };
          set(apis, apiName, fetchHoc(ns, apiName, deleteCall));
        }
        break;
      default:
        break;
    }
  });
  return apis as unknown as PromiseWrap<T>;
};
