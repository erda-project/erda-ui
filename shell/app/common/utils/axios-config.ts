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

import { set, some } from 'lodash';
import { axios } from 'core/service';
import { downloadFileAxios, getCookies, getOrgFromPath, setApiWithOrg } from './index';
import { getCurrentLocale } from 'i18n';
import { getGlobal } from '../../global-space';
import userStore from 'app/user/stores';

const isExcludeOrgHeaderApi = (url: string) => {
  const excludeApis = ['/api/files', '/api/uc'];
  return some(excludeApis, (api) => url.startsWith(api));
};

export const initAxios = () => {
  // intercept request
  axios.interceptors.request.use(
    (config) => {
      const { headers, method = 'GET', url = '' } = config;
      headers.Accept = 'application/vnd.dice+json;version=1.0';
      headers.Lang = getCurrentLocale().key === 'zh' ? 'zh-CN' : 'en-US';
      if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
        const token = getCookies('OPENAPI-CSRF-TOKEN');
        if (token) {
          headers['OPENAPI-CSRF-TOKEN'] = token;
        }
      }

      const header = getGlobal('service-provider');
      if (header) {
        headers['service-provider'] = header;
      }
      // handle api/spot api prefix
      if (url.startsWith('/api/spot/')) {
        set(config, 'url', url.replace('/api/spot/', '/api/'));
      }
      const curOrg = getOrgFromPath();
      if (curOrg) {
        headers.org = curOrg;
      }
      if (!isExcludeOrgHeaderApi(url)) {
        set(config, 'url', setApiWithOrg(url));
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // intercept response
  axios.interceptors.response.use(
    (response) => {
      if (response.config.responseType === 'blob') {
        downloadFileAxios(response);
      }
      // if paging list is null, transform to array
      const { data } = response.data || {};
      if (Object.prototype.toString.call(data) === '[object Object]') {
        if ('list' in data && 'total' in data && data.list === null) {
          data.list = [];
        }
      }
      return response;
    },
    async (error) => {
      if (error.response.status === 401) {
        // 401 re-login
        const data = await axios.get('/api/openapi/login');
        if (data.data && data.data.url) {
          const loginUser = userStore.getState((s) => s.loginUser);
          const lastPath = `${window.location.pathname}${window.location.search}`;
          window.localStorage.setItem(`${loginUser.id}-lastPath`, lastPath);
          window.location.href = data.data.url;
        }
      }
      return Promise.reject(error);
    },
  );
};
