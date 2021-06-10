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
import { PageHeader } from 'app/nusi';
import { Tab } from 'layout/pages/tab/tab';
import layoutStore from 'layout/stores/layout';
import { goTo } from 'common/utils';
import routeInfoStore from 'common/stores/route';
import breadcrumbStore from 'layout/stores/breadcrumb';
import { filter, isEmpty, isFunction } from 'lodash';
import { matchPath } from 'react-router-dom';
import { Right as IconRight } from '@icon-park/react';
import './header.scss';

const Header = () => {
  const [headerInfo, currentApp] = layoutStore.useStore((s) => [s.headerInfo, s.currentApp]);
  const [query, routes] = routeInfoStore.useStore((s) => [s.query, s.routes]);
  const infoMap = breadcrumbStore.useStore((s) => s.infoMap);
  const lastRoute = React.useRef(undefined as undefined | IRoute);
  const lastRouteName = React.useRef(undefined as undefined | string);
  const [pageName, setPageName] = React.useState('');
  React.useEffect(() => {
    setPageName(lastRouteName.current as string);
  }, [routes]);

  React.useEffect(() => {
    document.title = pageName ? `${pageName} · Erda` : 'Erda';
  }, [pageName]);

  const checkHasTemplate = ({ name, params }: { name: string; params: object }) => {
    const replacePattern = /\{([\w.])+\}/g;
    let breadcrumbName = name;
    const matches = (breadcrumbName as string).match(replacePattern);
    if (!matches) {
      return breadcrumbName;
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
      breadcrumbName = (breadcrumbName as string).replace(match, value);
    });
    if (breadcrumbName === 'undefined') {
      breadcrumbName = '';
    }
    return breadcrumbName;
  };

  const itemRender = (route: IRoute, params: object, _routes: IRoute[], paths: string[]) => {
    const { breadcrumbName, path, eternal, changePath, pageName: pName } = route;
    let name = breadcrumbName;
    if (!name) {
      if (pName) {
        lastRouteName.current = pName;
      }
      return null;
    }
    if (isFunction(name)) {
      name = name({ infoMap, route, params, query, paths });
    } else {
      name = checkHasTemplate({ name, params });
    }

    if (lastRoute.current === route) {
      lastRouteName.current = name;
      setPageName(name as string);
      return null;
    }

    const currentPath = paths[paths.length - 1];
    const lastPath = paths.length > 1 ? paths[paths.length - 2] : '';

    let finalPath = route.encode
      ? `${lastPath}/${encodeURIComponent(params[route.relativePath.slice(1)])}`
      : currentPath; // 因为router v4没有了相对路径所有不用拼路径 `/${encodedPaths.join('/')}`;
    if (changePath) {
      finalPath = changePath(finalPath);
    }

    const link = `/${finalPath}`;
    return (
      <span
        className={`breadcrumb-name ${route.disabled ? 'breadcrumb-disabled' : ''}`}
        title={link}
        key={eternal || path}
        onClick={() => !route.disabled && goTo(link)}
      >
        {name}
      </span>
    );
  };

  const allRoutes = filter(routes, (route) => {
    return (
      !isEmpty(route.path) &&
      (!isEmpty(route.breadcrumbName) || !isEmpty(route.pageName) || typeof route.breadcrumbName === 'function')
    );
  });

  // get params from path
  let params = {};
  if (routes.length > 0) {
    const match =
      matchPath(window.location.pathname, {
        path: routes[0].path,
        exact: true,
        strict: false,
      }) || ({} as any);
    params = match && match.params;
  }

  if (allRoutes.length) {
    lastRoute.current = allRoutes[0];
  }

  if (!isEmpty(currentApp)) {
    const eternalApp = {
      eternal: currentApp.href,
      breadcrumbName: currentApp.breadcrumbName,
      path: typeof currentApp.path === 'function' ? currentApp.path(params || {}, routes) : currentApp.href,
    };
    allRoutes.reverse().splice(1, 0, eternalApp as IRoute);
  }
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
