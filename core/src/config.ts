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
type ConfigType = 'onAPISuccess' | 'onAPIFail' | 'history';

const config: { [k in ConfigType]?: any } = {};

export const getConfig = (key: ConfigType) => config[key];
export const setConfig = (key: ConfigType, value: any) => {
  config[key] = value;
};

export const getCSRFToken = () => {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    // 因后端加了对openapi-csrf-token的保护，前端本地读取不到，所以使用本地localstorage来保存测试的值，值来源于后端第一返回的set-cookies
    return window.localStorage.getItem('ERDA_LOCAL_CSRF_TOKEN') || '';
  } else {
    return getCookies('OPENAPI-CSRF-TOKEN');
  }
};

function getCookies(key: string) {
  const cookies: Obj = {};
  window.document.cookie.split(';').forEach((item) => {
    const [k, v] = item.split('=');
    cookies[k.trim()] = v && v.trim();
  });
  return key ? cookies[key] : cookies;
}
