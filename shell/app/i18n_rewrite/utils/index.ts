import localCache from './cache';
import mergedJSON from './mergedJSON';
import _ from 'lodash';

export interface ITranslation {
  en: string;
  zh: string;
}
type localeType = 'en' | 'zh';

const nsSeparator = ':';
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
  // 1. 从 localStorage 中查找
  // 2. 从 json 中查找
  return getTransFromLocalStorage(ns, key, locale) || getTransFromJSON(ns, key, locale);
}

export function getTransFromLocalStorage(ns: string, key: string, locale: localeType): string {
  const res = localCache.getCache(`i18n-${locale}`);
  return res && res[ns] && res[ns][key];
}

export function getTransFromJSON(ns: string, key: string, locale: localeType): string | undefined {
  return mergedJSON[locale][ns] && mergedJSON[locale][ns][key];
}

export function setTrans2LocalStorage(ns: string, key: string, value: string, locale: localeType) {
  // 保存修改的翻译到 localStorage
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
  // 获取 localStorage 中修改的数量
  const res = localCache.getCache('i18n-zh');
  let count = 0;
  res && Object.keys(res).forEach((ns) => (count += Object.keys(res[ns]).length));
  return count;
}

export function clearLocalStorage() {
  localCache.deleteCache('i18n-en');
  localCache.deleteCache('i18n-zh');
}

export function mergeLocalStorage2JSON() {
  // 将 localStorage 保存的字段和现有的 JSON 对象合并
  return JSON.stringify(
    _.merge(mergedJSON, {
      en: localCache.getCache('i18n-en'),
      zh: localCache.getCache('i18n-zh'),
    }),
  );
}
