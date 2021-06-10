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

const warn = (msg: string) => console.error(`[Master warn]: ${msg}`);
const moduleMap = {};

interface IModule {
  models: IModel[];
  routes: object[];
}
// 注册 模块
export function registModule(moduleName: string, content: IModule) {
  if (moduleMap[moduleName]) {
    warn(`module: ${String(moduleName)} 已注册`);
    return content;
  }
  moduleMap[moduleName] = content;
  const { models, routes } = content;

  console.log('注册models：', models);
  registModels(models);
  console.log('注册路由：', routes);
  emit('route:regist', routes);
}

interface IModel {
  namespace: string;
  state: object;
  effects: object;
  reducers: object;
  subscriptions: object;
  [key: string]: any;
}
// 注册 model
const modelNames = {};
function registModels(models: IModel[]) {
  let _models = models;
  if (!Array.isArray(models)) {
    warn('注册models时参数应为数组');
    _models = [models];
  }
  _models = _models.filter((m) => {
    const exist = modelNames[m.namespace];
    if (exist) {
      warn(`model: ${String(m.namespace)} 已注册`);
    } else {
      modelNames[m.namespace] = true;
    }
    return !exist;
  });
  if (_models.length) {
    emit('model:regist', _models);
  }
}

// export function unRegistModule(moduleName) {
//   moduleMap[moduleName] = undefined;
// }

export function getModule(moduleName: string) {
  return moduleMap[moduleName];
}

export function getModuleMap() {
  return { ...moduleMap };
}

// 全局的eventHub
const hub = {};
const init = {}; // 保留注册之前先执行了emit的数据
export function off(type: string, cb: Function) {
  hub[type] = hub[type].filter((item: Function) => item !== cb);
}
export function on(type: string, cb: Function, clearInit: boolean) {
  if (init[type] !== undefined) {
    cb(init[type]);
    clearInit && (init[type] = undefined);
  }
  hub[type] = (hub[type] || []).concat(cb);
  return () => off(type, cb);
}
export function emit(type: string, data: any) {
  if (!hub[type]) {
    init[type] = data;
    return;
  }
  hub[type].forEach((cb: Function) => cb(data));
}

// 插入独立模块entry script
const inserted = {};
let loadingModule = false;
export function insert(moduleNames: string[] | string, requireVendorModules?: string[]) {
  let modules = moduleNames as string[];
  if (typeof moduleNames === 'string') {
    modules = [moduleNames];
  }
  modules.forEach((moduleName: string) => {
    if (inserted[moduleName] === undefined) {
      loadingModule = true;
      let moduleScript = document.createElement('script');
      moduleScript.setAttribute('src', `/static/${moduleName}/scripts/${moduleName}.js`);
      document.body.appendChild(moduleScript);
      inserted[moduleName] = true;

      if (requireVendorModules && requireVendorModules.includes(moduleName)) {
        moduleScript = document.createElement('script');
        moduleScript.setAttribute('src', `/static/${moduleName}/scripts/vendors~${moduleName}.js`);
        document.body.appendChild(moduleScript);
      }
    }
  });
}

export function stopLoadingModule() {
  loadingModule = false;
}

export function isLoadingModule() {
  return !!loadingModule;
}
