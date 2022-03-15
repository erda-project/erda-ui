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

import React from 'react';
import ReactDom from 'react-dom';
import { useLocation } from 'react-use';
import { Router } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { registStore } from './framework/regist-store';
import { IGetRouter, registRouters } from './framework/regist-router';
import i18n, { initI18n } from './i18n';
import routeInfoStore from './stores/route';
import { emit } from './utils/event-hub';
import browserHistory from './history';
import { getConfig, setConfig } from './config';
import { setGlobal, GLOBAL_KEY } from './utils/global-space';
import { initModuleFederationModule, useDynamicScript } from './utils/mf-helper';

// @ts-ignore if not use it, minified build file will cause infinite loop when use ReactDom.render. errMsg: Cannot set property 'getCurrentStack' of undefined
const holderReactDom = ReactDom;

setConfig('history', browserHistory);
interface DynamicModule {
  name: string;
  routePrefix: string;
}

const matchEnterpriseRoute = (dynamicModules: DynamicModule[]) => {
  const target = dynamicModules.find(({ routePrefix }) => {
    const routeRegex = new RegExp(`^/[^/]+${routePrefix}`);
    if (routeRegex.test(location.pathname)) {
      return true;
    }
    return false;
  });
  return target;
};

const App = ({ dynamicModules = [] }: { dynamicModules?: DynamicModule[] }) => {
  const route = routeInfoStore.useStore((s) => s.parsed);
  const location = useLocation();
  // register enterprise remotes
  const [scriptSource, setScriptSource] = React.useState<{ url?: string; remoteName?: string }>({});
  const [loadedSource, setLoadedSource] = React.useState<string[]>([]);
  const { ready, failed } = useDynamicScript(scriptSource);

  React.useEffect(() => {
    const currentModule = matchEnterpriseRoute(dynamicModules);
    if (currentModule && !loadedSource.includes(currentModule.name)) {
      setGlobal(GLOBAL_KEY.LOADING_MODULE, true);
      setScriptSource({
        url: `/static/${currentModule.name}/scripts/mf_${currentModule.name}.js`,
        remoteName: currentModule.name,
      });
    }
  }, [location.pathname]);

  React.useEffect(() => {
    if (failed) {
      emit('loadingModuleFailed');
      setGlobal(GLOBAL_KEY.LOADING_MODULE, false);
    }
  }, [failed]);

  React.useEffect(() => {
    if (ready && scriptSource.remoteName) {
      const initFn = initModuleFederationModule(`mf_${scriptSource.remoteName}`, './entry');
      initFn.then((fn) => {
        fn.default(registerModule);
        setLoadedSource([...loadedSource, scriptSource.remoteName!]);
        setGlobal(GLOBAL_KEY.LOADING_MODULE, false);
      });
    }
  }, [ready]);

  React.useEffect(() => {
    browserHistory.listen((loc) => {
      emit('@routeChange', routeInfoStore.reducers.$_updateRouteInfo(loc));
    });
  }, []);

  if (!route?.component) {
    return null;
  }

  return <Router history={browserHistory}>{renderRoutes([route])}</Router>;
};

export const startApp = () => {
  return initI18n.then(() => {
    return App;
  });
};

export interface IModule {
  key: string;
  stores?: any[];
  routers?: IGetRouter;
  locales?: {
    key: string;
    zh: Record<string, string>;
    en: Record<string, string>;
  };
  Root?: React.ComponentType;
  NotFound?: React.ComponentType;
}

let storeList: any[] = [];

const getStores = () => {
  return storeList;
};

export const registerModule = (
  { key, stores, routers, locales, Root, NotFound }: IModule,
  cb?: (params: { stores?: any[]; history: any }) => void,
) => {
  if (locales && locales.zh && locales.en) {
    const namespaces = Object.keys(locales.zh);
    namespaces.forEach((ns) => {
      i18n.addResourceBundle('zh', ns, locales.zh[ns]);
      i18n.addResourceBundle('en', ns, locales.en[ns]);
    });
  }
  if (stores) {
    stores.forEach(registStore);
    storeList = [...storeList, ...stores];
  }
  if (routers) {
    const routeData = registRouters(key, routers, { Root, NotFound });
    const latestRouteInfo = routeInfoStore.reducers.$_updateRouteInfo(browserHistory.location, routeData, {
      force: true,
    });
    emit('@routeChange', latestRouteInfo);
  }
  const history = getConfig('history');
  setTimeout(() => {
    typeof cb === 'function' && cb({ stores: getStores(), history });
  });
};

export const registerModules = (modules: IModule[]) => {
  (modules || []).map((item) => registerModule(item));
};
