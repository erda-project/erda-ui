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

import i18n from 'i18next';
import moment from 'moment';
import 'moment/locale/zh-cn';
import nusi_enUS from '@terminus/nusi/es/locale/en_US';
import nusi_zhCN from '@terminus/nusi/es/locale/zh_CN';

import antd_zhCN from 'antd/es/locale-provider/zh_CN';
import antd_enUS from 'antd/es/locale-provider/en_US';

import antd4_zhCN from 'antd-latest/es/locale-provider/zh_CN';
import antd4_enUS from 'antd-latest/es/locale-provider/en_US';


let userLanguage = window.navigator.userLanguage || window.navigator.language;
userLanguage = userLanguage === 'zh-CN' ? 'zh' : 'en';

const defaultLocale = window.localStorage.getItem('locale') || userLanguage;
window.localStorage.setItem('locale', defaultLocale);
const localeMap = {
  en: {
    key: 'en',
    app: {},
    antd: antd_enUS,
    antd4: antd4_enUS,
    nusi: nusi_enUS,
    moment: 'en',
  },
  zh: {
    key: 'zh',
    app: {},
    antd: antd_zhCN,
    antd4: antd4_zhCN,
    nusi: nusi_zhCN,
    moment: 'zh-cn',
  },
};

let currentLocale = localeMap[defaultLocale];
document.body.lang = currentLocale.key;

export function setLocale(lng: string) {
  const localeObj = localeMap[lng] || localeMap[defaultLocale];
  moment.locale(localeObj.moment);
  return i18n
    .changeLanguage(lng.split('-')[0])
    .then(() => {
      currentLocale = localeObj;
      window.localStorage.setItem('locale', currentLocale.key);
      return currentLocale;
    });
}

export function getCurrentLocale() {
  return currentLocale;
}

export function isZh() {
  return currentLocale.key === 'zh';
}

export function getLang() {
  return getCurrentLocale().key === 'zh' ? 'zh-CN' : 'en-US';
}

i18n.d = (zhWords: string) => zhWords;

export const initI18n = i18n.init({
  // we init with resources
  lng: defaultLocale,
  fallbackLng: 'zh',
  debug: process.env.NODE_ENV !== 'production',

  resources: {},

  // have a common namespace used around the full app
  ns: [],
  defaultNS: 'default',

  keySeparator: false, // we use content as keys

  interpolation: {
    prefix: '{',
    suffix: '}',
    formatSeparator: ',',
    format(value, format, lng) {
      if (format === 'uppercase') return value.toUpperCase();
      if (value instanceof Date) return moment(value).format(format);
      return value;
    },
  },

  react: {
    wait: true,
  },
});

export default i18n;
