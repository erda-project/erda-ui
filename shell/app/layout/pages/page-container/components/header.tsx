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
import { PageHeader } from 'core/nusi';
import { Tab } from 'layout/pages/tab/tab';
import layoutStore from 'layout/stores/layout';
import { goTo } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import breadcrumbStore from 'layout/stores/breadcrumb';
import { isEmpty, isFunction } from 'lodash';
import { matchPath } from 'react-router-dom';
import { Right as IconRight } from '@icon-park/react';
import './header.scss';

const BreadcrumbItem = ({
  route,
  paths,
  params,
  title,
}: {
  route: IRoute;
  params: Obj<string>;
  paths: string[];
  title?: string;
}) => {
  const { path, eternal, changePath, pageName } = route;
  const [link, setLink] = React.useState('');

  React.useEffect(() => {
    const currentPath = paths[paths.length - 1];
    const lastPath = paths.length > 1 ? paths[paths.length - 2] : '';

    let finalPath = route.encode
      ? `${lastPath}/${encodeURIComponent(params[route.relativePath.slice(1)])}`
      : currentPath;
    if (changePath) {
      finalPath = changePath(finalPath);
    }

    setLink(`/${finalPath}`);
  }, [changePath, params, paths, route.encode, route.relativePath]);

  const displayTitle = title || pageName;

  return displayTitle ? (
    <span
      className={`breadcrumb-name ${route.disabled ? 'breadcrumb-disabled' : ''}`}
      title={displayTitle}
      key={eternal || path}
      onClick={() => !route.disabled && goTo(link)}
    >
      {displayTitle}
    </span>
  ) : null;
};

const Header = () => {
  const [headerInfo, currentApp] = layoutStore.useStore((s) => [s.headerInfo, s.currentApp]);
  const routes: IRoute[] = routeInfoStore.useStore((s) => s.routes);
  const [pageName, setPageName] = React.useState<string>();
  const infoMap = breadcrumbStore.useStore((s) => s.infoMap);
  const [query] = routeInfoStore.useStore((s) => [s.query]);

  const [allRoutes, setAllRoutes] = React.useState<IRoute[]>([]);
  const [params, setParams] = React.useState<Obj<string>>({});

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
    (route: IRoute) => {
      const { breadcrumbName, pageName: _pageName } = route;
      let _title = '';
      if (isFunction(breadcrumbName)) {
        _title = breadcrumbName({ infoMap, route, params, query });
      } else {
        _title = checkHasTemplate(breadcrumbName as string);
      }
      return _title || _pageName;
    },
    [checkHasTemplate, infoMap, params, query],
  );

  React.useEffect(() => {
    if (allRoutes.length) {
      const lastRoute = allRoutes[allRoutes.length - 1];
      const _title = getBreadcrumbTitle(lastRoute);
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
    }
    const filteredRoutes = routes.filter((route) => {
      return route.path && (route.breadcrumbName || route.pageName || typeof route.breadcrumbName === 'function');
    });
    if (!isEmpty(currentApp)) {
      const eternalApp = {
        eternal: currentApp.href,
        breadcrumbName: currentApp.breadcrumbName,
        path: typeof currentApp.path === 'function' ? currentApp.path(_params || {}, routes) : currentApp.href,
      };
      filteredRoutes.reverse().splice(1, 0, eternalApp as IRoute);
      setAllRoutes(filteredRoutes);
    }
  }, [currentApp, routes]);

  const itemRender = (route: IRoute, _params: Obj<string>, _routes: IRoute[], paths: string[]) => {
    if (!route.breadcrumbName || (allRoutes.length && allRoutes[allRoutes.length - 1] === route)) {
      return null;
    }
    const _title = getBreadcrumbTitle(route);
    return _title && <BreadcrumbItem paths={[...paths]} route={route} params={_params} title={_title} />;
  };

  return (
    <PageHeader
      breadcrumb={{
        routes: allRoutes,
        itemRender,
        params,
        separator: <IconRight size="14px" />,
      }}
      title={pageName}
    >
      {headerInfo && <div className="header-info">{React.cloneElement(headerInfo)}</div>}
      <Tab />
    </PageHeader>
  );
};

export default Header;
