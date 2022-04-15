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
import { parse } from 'query-string';
import { Tab } from 'layout/pages/tab/tab';
import layoutStore from 'layout/stores/layout';
import routeInfoStore from 'core/stores/route';
import breadcrumbStore from 'layout/stores/breadcrumb';
import { isEmpty, isFunction } from 'lodash';
import { matchPath } from 'react-router-dom';
import { ErdaIcon } from 'common';
import { goTo } from 'app/common/utils';
import './header.scss';

const Header = () => {
  const [currentApp, topButtonsWidth] = layoutStore.useStore((s) => [s.currentApp, s.topButtonsWidth]);
  const [routes, markedRoutePreview] = routeInfoStore.useStore((s) => [s.routes, s.markedRoutePreview]);
  const [pageName, setPageName] = React.useState<string>();
  const [backToUp, setBackToUp] = React.useState(0);
  const infoMap = breadcrumbStore.useStore((s) => s.infoMap);
  const [query] = routeInfoStore.useStore((s) => [s.query]);
  const [backToUpKey, setBackToUpKey] = React.useState('');

  const [allRoutes, setAllRoutes] = React.useState<IRoute[]>([]);
  const [params, setParams] = React.useState<Obj<string>>({});
  const [pageNameInfo, setPageNameInfo] = React.useState<Function>();
  const checkHasTemplate = React.useCallback(
    (breadcrumbName: string) => {
      const replacePattern = /\{([\w.])+\}/g;
      let _breadcrumbName = breadcrumbName || '';
      const matches = _breadcrumbName.match(replacePattern);
      if (!matches) {
        return _breadcrumbName;
      }
      matches.forEach((match: string) => {
        const [type, key] = match.slice(1, -1).split('.'); // match: {params.id}
        let value;
        if (type === 'params') {
          value = params[key];
        } else if (type === 'query') {
          value = decodeURIComponent(query[key]);
        } else {
          value = infoMap[type];
        }
        _breadcrumbName = _breadcrumbName.replace(match, value);
      });
      if (_breadcrumbName === 'undefined') {
        _breadcrumbName = '';
      }
      return _breadcrumbName;
    },
    [infoMap, params, query],
  );

  const getBreadcrumbTitle = React.useCallback(
    (route: IRoute, isBreadcrumb = false) => {
      const { breadcrumbName, pageName } = route;
      let _title = '';
      if (!isBreadcrumb && pageName) {
        _title = isFunction(pageName)
          ? breadcrumbName({ infoMap, route, params, query })
          : checkHasTemplate(pageName as string);
      } else {
        _title = isFunction(breadcrumbName)
          ? breadcrumbName({ infoMap, route, params, query })
          : checkHasTemplate(breadcrumbName as string);
      }
      return _title;
    },
    [checkHasTemplate, infoMap, params, query],
  );

  React.useEffect(() => {
    if (allRoutes.length) {
      const lastRoute = allRoutes[allRoutes.length - 1];
      const _title = getBreadcrumbTitle(lastRoute);
      setPageNameInfo(() => lastRoute?.pageNameInfo);
      setPageName(_title);
    }
  }, [allRoutes, getBreadcrumbTitle]);

  React.useEffect(() => {
    document.title = pageName ? `${pageName} · Erda` : 'Erda';
  }, [pageName]);

  React.useEffect(() => {
    let _params: Obj<string> = {};
    // get params from path
    if (routes.length > 0) {
      const match = matchPath(window.location.pathname, {
        path: routes[0].path,
        exact: true,
        strict: false,
      });
      if (match) {
        _params = match.params;
        setParams(_params);
      }
      let backToUpLevel = 0;
      const currentRoute = routes[0];
      if (currentRoute.backToUp) {
        const targetRoute = routes.find((a) => a.mark === currentRoute.backToUp);
        if (targetRoute) {
          backToUpLevel = location.pathname.split('/').length - targetRoute.path.split('/').length;
        }
      }
      setBackToUpKey(currentRoute.backToUp);
      setBackToUp(backToUpLevel);
    }
    const filteredRoutes = routes.filter((route) => {
      return route.path && (route.breadcrumbName || route.pageName || typeof route.breadcrumbName === 'function');
    });
    if (!isEmpty(currentApp)) {
      const eternalApp = {
        key: currentApp.key,
        eternal: currentApp.href,
        breadcrumbName: currentApp.breadcrumbName,
        path: typeof currentApp.path === 'function' ? currentApp.path(_params || {}, routes) : currentApp.href,
      };
      filteredRoutes.reverse().splice(1, 0, eternalApp as IRoute);
      setAllRoutes(filteredRoutes);
    }
  }, [currentApp, routes]);

  const displayPageName = () => {
    if (typeof pageNameInfo === 'function') {
      const Comp = pageNameInfo;
      return <Comp />;
    }
    if (backToUp) {
      const search = markedRoutePreview[backToUpKey];
      const _query = search ? { ...parse(search, { arrayFormat: 'bracket' }) } : undefined;
      return (
        <div
          className="text-xl truncate inline-flex items-center cursor-pointer"
          onClick={() => goTo('../'.repeat(backToUp), { query: _query })}
        >
          <ErdaIcon type="arrow-left" className="mr-1" />
          {pageName}
        </div>
      );
    }
    return <div className="text-xl truncate">{pageName}</div>;
  };

  return (
    <div className="erda-header" style={{ marginRight: topButtonsWidth }}>
      <div className="erda-header-title-con inline-flex">{pageName && displayPageName()}</div>
      <Tab />
    </div>
  );
};

export default Header;
