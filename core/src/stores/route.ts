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

import { createStore } from '../cube';
import { parse } from 'query-string';
import { pathToRegexp, Key } from 'path-to-regexp';
import { on } from '../utils/event-hub';

interface IRouteInfo {
  routes: SHELL.Route[];
  params: {
    [k: string]: string;
  };
  query: {
    [k: string]: string;
  };
  currentRoute: SHELL.Route | {};
  routeMarks: string[];
  routePatterns: string[];
  routeMap: Record<string, SHELL.Route>;
  urlFullRecord: Set<string>;
  urlPathRecord: Set<string>;
  urlState: 'back' | 'new' | 'forward';
  parsed: any;
  markedRoutePreview: Obj<string>;
  prevRouteInfo: IRouteInfo;
  isIn: (mark: string) => boolean;
  isMatch: (pattern?: string | RegExp) => boolean;
  isEntering: (mark: string) => boolean;
  isLeaving: (mark: string) => boolean;
}

const initRouteInfo: IRouteInfo = {
  routes: [],
  params: {},
  query: {},
  currentRoute: {},
  routeMarks: [],
  routePatterns: [],
  routeMap: {},
  parsed: {},
  urlPathRecord: new Set([]),
  markedRoutePreview: {},
  urlFullRecord: new Set([]),
  urlState: 'new',
  isIn: () => false,
  isMatch: () => false,
  isEntering: () => false,
  isLeaving: () => false,
  prevRouteInfo: {} as unknown as IRouteInfo,
};

/**
 * 保持路由query参数，实现从同级路由或子级路由返回时能拿到保持的参数
 * 进入任意路由时，会清除所有层级更深的（不一定是直系下级）路由的query
 * 因为修改location.search会刷新页面，所以不会恢复到url上，只在store中存在
 * 结构以路由层级为key，pattern为子级key
 * {
 *    1: {
 *      '/path/:param': { appId: 1, ... }
 *    }
 * }
 */
const queryLevelMap: Obj = {};
let prevPath: string;
let prevSearch: string;

const routeInfoStore = createStore({
  name: 'routeInfo',
  state: initRouteInfo,
  reducers: {
    $_updateRouteInfo(
      state,
      location: { pathname: string; search: string; key: string },
      extraData?: any,
      extraPayload?: { force?: boolean },
    ) {
      const { pathname, search, key: urlKey } = location;
      const { force = false } = extraPayload || {};
      const prevRouteInfo = state;
      if (!force && prevPath === pathname && search === prevSearch) {
        return prevRouteInfo;
      }
      prevPath = pathname;
      prevSearch = search;
      const query = { ...parse(search, { arrayFormat: 'bracket' }) }; // parse出来的对象prototype为null，fast-deep-equal判断时报错
      let routes: IRouteInfo[] = [];
      const params: Obj = {};
      const { routePatterns, routeMap, parsed } = extraData || prevRouteInfo;
      let currentRoute = null;
      let routeMarks: string[] = [];

      const findParent = (item: any) => {
        const { _parent, mark } = item;
        if (mark) {
          routeMarks.push(mark);
        }
        if (_parent) {
          routes.push(_parent);
          findParent(_parent);
        }
      };

      for (let i = 0; i < routePatterns?.length; i++) {
        const pattern = routePatterns[i];

        const keys: Key[] = [];
        const match = pathToRegexp(pattern, keys).exec(pathname);

        if (match) {
          keys.forEach((k, j) => {
            if (k.name !== 0) {
              // 移除 * 号匹配时的0字段
              params[k.name] = match[j + 1];
            }
          });
          currentRoute = routeMap[pattern].route;
          const routeLevel = pattern.split('/').length;
          Object.keys(queryLevelMap).forEach((level) => {
            // 清除大于当前层级(更深)的路由的query
            if (routeLevel < level) {
              Object.values(queryLevelMap[level]).forEach((r) => {
                r.routeQuery = {};
              });
            }
          });

          // 如果需要保持路由query
          if (currentRoute.keepQuery) {
            currentRoute.routeQuery = { ...currentRoute.routeQuery, ...query };
            queryLevelMap[routeLevel] = queryLevelMap[routeLevel] || {};
            queryLevelMap[routeLevel][pattern] = currentRoute;
          }
          routes = [currentRoute];
          routeMarks = [];
          findParent(currentRoute);
          break;
        }
      }

      const curUrlPaths = new Set(state.urlPathRecord);
      const curUrlFull = new Set(state.urlFullRecord);
      let urlState = 'new';
      if (curUrlFull.has(urlKey) && curUrlPaths.size > 1) {
        if (curUrlPaths.has(urlKey)) {
          urlState = 'back';
          curUrlPaths.delete(urlKey);
        } else {
          urlState = 'forward';
          curUrlPaths.add(urlKey);
        }
      } else {
        curUrlPaths.add(urlKey);
      }

      curUrlFull.add(urlKey);

      const markedRoutePreview = {
        ...state.markedRoutePreview,
        ...(currentRoute.searchMark ? { [currentRoute.searchMark]: search } : {}),
      };
      const routeInfo = {
        prevRouteInfo,
        params,
        query,
        routes,
        currentRoute,
        markedRoutePreview,
        urlFullRecord: curUrlFull,
        urlPathRecord: curUrlPaths,
        urlState,
        routePatterns,
        routeMap,
        parsed,
        routeMarks,
        isIn: (level: string) => routeMarks.includes(level),
        isMatch: (pattern: string) => !!pathToRegexp(pattern, []).exec(pathname),
        isEntering: (level: string) => routeMarks.includes(level) && !prevRouteInfo.routeMarks.includes(level),
        isLeaving: (level: string) => !routeMarks.includes(level) && prevRouteInfo.routeMarks.includes(level),
      };

      return routeInfo;
    },
  },
});

export const listenRoute = (cb: Function) => {
  // 初始化时也调用一次
  cb(routeInfoStore.getState((s) => s));
  on('@routeChange', cb);
};

export default routeInfoStore;
