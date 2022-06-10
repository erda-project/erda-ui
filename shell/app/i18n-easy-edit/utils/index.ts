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

import localCache from './cache';
import mergedJSON from './mergedJSON';
import { getCurrentLocale } from 'core/i18n';
import { merge, cloneDeep } from 'lodash';
import config from '../config';

type LocaleType = 'en' | 'zh';

const { nsSeparator, defaultNs, editAccessFromLocalStorage } = config;

export function isAccessFromLocalStorage() {
  return localCache.getCache(editAccessFromLocalStorage.key) === editAccessFromLocalStorage.value;
}

export function splitKey(combinedKey: string) {
  const temp = combinedKey.split(nsSeparator);
  const ns = temp.length === 1 ? defaultNs : temp[0];
  const key = temp.length === 1 ? temp[0] : temp[1];
  return [ns, key];
}

export function getCombinedKey(ns: string, key: string) {
  ns = ns === '' ? defaultNs : ns;
  return [ns, key].join(nsSeparator);
}

export function getTranslation(ns: string, key: string, locale: LocaleType): string | null {
  // 1. find from localStorage
  // 2. find from json
  return getTransFromLocalStorage(ns, key, locale) || getTransFromJSON(ns, key, locale);
}

export function getTransFromLocalStorage(
  ns: string,
  key: string,
  locale: LocaleType = getCurrentLocale().key,
): string | null {
  const res = localCache.getCache(`i18n-${locale}`);
  return res?.[ns]?.[key] || null;
}

export function getTransFromJSON(ns: string, key: string, locale: LocaleType): string | null {
  const path = Object.keys(mergedJSON).find((path) => {
    return mergedJSON[path]?.[locale]?.[ns]?.[key];
  });
  return path ? mergedJSON[path][locale][ns][key] : null;
}

export function setTrans2LocalStorage(ns: string, key: string, value: string, locale: LocaleType) {
  const res = localCache.getCache(`i18n-${locale}`);
  if (!res) {
    localCache.setCache(`i18n-${locale}`, {});
  }
  const obj = {
    [ns]: {
      [key]: value,
    },
  };
  localCache.setCache(`i18n-${locale}`, merge(res, obj));
}

export function getEditCount(): number {
  // get localStorage saved count
  const res = localCache.getCache('i18n-zh');
  let count = 0;
  res && Object.keys(res).forEach((ns) => (count += Object.keys(res[ns]).length));
  return count;
}

export function clearLocalStorage() {
  localCache.deleteCache('i18n-en');
  localCache.deleteCache('i18n-zh');
}

export function mergeLocalStorage2JSON(): string | undefined {
  // merge localStorage saved object with JSON
  const modifiedObj = {
    en: localCache.getCache('i18n-en'),
    zh: localCache.getCache('i18n-zh'),
  };
  if (!localCache.getCache('i18n-en')) return;
  // traverse through localStorage saved object, attach paths
  const mergedModifiedObj = {};
  function _fn(locale: LocaleType) {
    Object.keys(modifiedObj[locale]).forEach((ns) => {
      Object.keys(modifiedObj[locale][ns]).forEach((key) => {
        const path = Object.keys(mergedJSON).find((path) => {
          return mergedJSON[path][locale][ns] && mergedJSON[path][locale][ns][key];
        });
        if (path) {
          !mergedModifiedObj[path] && (mergedModifiedObj[path] = { en: {}, zh: {} });
          !mergedModifiedObj[path][locale][ns] && (mergedModifiedObj[path][locale][ns] = {});
          mergedModifiedObj[path][locale][ns][key] = modifiedObj[locale][ns][key];
        }
      });
    });
  }
  _fn('en');
  _fn('zh');
  const res = {};
  const cloneMergedJSON = cloneDeep(mergedJSON);
  Object.keys(mergedModifiedObj).forEach((path) => {
    // only add modified JSON
    res[path] = cloneMergedJSON[path];
  });
  merge(res, mergedModifiedObj);

  return JSON.stringify(res);
}
