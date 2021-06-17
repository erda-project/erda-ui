import { set, some } from 'lodash';
import axios from 'axios';
import { downloadFileAxios, getCookies, getOrgFromPath, setApiWithOrg } from './index';
import { getCurrentLocale } from 'i18n';
import { getGlobal } from '../../global-space';
import userStore from 'app/user/stores';

const isExcludeOrgHeaderApi = (url: string) => {
  const excludeApis = ['/api/files'];
  return some(excludeApis, (api) => api.startsWith(url));
};

export const initAxios = () => {
  // intercept request
  axios.interceptors.request.use(
    (config) => {
      const { headers, method = 'GET', url = '' } = config;
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
      const { data } = response.data;
      if ('list' in data && 'total' in data && data.list === null) {
        data.list = [];
      }
      return response;
    },
    async (error) => {
      if (error.response.status === 401) {
        // 401 re-login
        const data = await axios.get('/api/openapi/login');
        if (data.data && data.data.url) {
          const loginUser = userStore.getState((s) => s.loginUser);
          !loginUser.isSysAdmin && window.localStorage.setItem('lastPath', window.location.href);
          window.location.href = data.data.url;
        }
      }
      return Promise.reject(error);
    },
  );
};
