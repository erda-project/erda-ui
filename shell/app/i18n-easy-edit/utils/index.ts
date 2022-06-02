import localCache from './cache';
import mergedJSON from './mergedJSON';
import { getCurrentLocale } from 'i18n';
import _ from 'lodash';

export interface ITranslation {
  en: string;
  zh: string;
}
type localeType = 'en' | 'zh';

const nsSeparator = ':';

export function isEditAccess() {
  return localCache.getCache('i18n-edit-access') === true;
}
export function splitKey(combinedKey: string) {
  const temp = combinedKey.split(nsSeparator);
  const ns = temp.length === 1 ? 'default' : temp[0];
  const key = temp.length === 1 ? temp[0] : temp[1];
  return [ns, key];
}

export function getCombinedKey(ns: string, key: string) {
  ns = ns === '' ? 'default' : ns;
  return [ns, key].join(nsSeparator);
}

export function getTranslation(ns: string, key: string, locale: localeType): string | undefined {
  // 1. find from localStorage
  // 2. find from json
  return getTransFromLocalStorage(ns, key, locale) || getTransFromJSON(ns, key, locale);
}

export function getTransFromLocalStorage(
  ns: string,
  key: string,
  locale: localeType = getCurrentLocale().key,
): string | undefined {
  const res = localCache.getCache(`i18n-${locale}`);
  return res && res[ns] && res[ns][key];
}

export function getTransFromJSON(ns: string, key: string, locale: localeType): string | undefined {
  const path = Object.keys(mergedJSON).find((path) => {
    return mergedJSON[path][locale][ns] && mergedJSON[path][locale][ns][key];
  });
  return path && mergedJSON[path][locale][ns][key];
}

export function setTrans2LocalStorage(ns: string, key: string, value: string, locale: localeType) {
  const res = localCache.getCache(`i18n-${locale}`);
  if (!res) {
    localCache.setCache(`i18n-${locale}`, {});
  }
  const obj = {
    [ns]: {
      [key]: value,
    },
  };
  localCache.setCache(`i18n-${locale}`, _.merge(res, obj));
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
  function _fn(locale: localeType) {
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
  const cloneMergedJSON = _.cloneDeep(mergedJSON);
  Object.keys(mergedModifiedObj).forEach((path) => {
    // only add modified JSON
    res[path] = cloneMergedJSON[path];
  });
  _.merge(res, mergedModifiedObj);

  return JSON.stringify(res);
}
