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
import layoutStore from 'layout/stores/layout';
import { goTo } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import breadcrumbStore from 'layout/stores/breadcrumb';
import { isEmpty, isFunction } from 'lodash';
import { matchPath } from 'react-router-dom';
import { ErdaIcon } from 'common';

const getPath = (path: string, params: Obj<string>) => {
  path = (path || '').replace(/^\//, '');
  Object.keys(params).forEach((key) => {
    path = path.replace(`:${key}`, params[key]);
  });
  return path;
};

const BreadcrumbItem = ({
  route,
  paths,
  params,
  title,
  isLast,
}: {
  route: IRoute;
  params: Obj<string>;
  paths: string[];
  title?: string;
  isLast: boolean;
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
      className={`breadcrumb-name cursor-pointer hover:text-default ${isLast ? '' : 'text-sub'} ${
        route.disabled ? 'breadcrumb-disabled' : ''
      }`}
      title={displayTitle}
      key={eternal || path}
      onClick={() => !route.disabled && goTo(link)}
    >
      {displayTitle}
    </span>
  ) : null;
};

const ErdaBreadcrumb = () => {
  const [currentApp] = layoutStore.useStore((s) => [s.currentApp]);
  const routes: IRoute[] = routeInfoStore.useStore((s) => s.routes);
  const [pageName, setPageName] = React.useState<string>();
  const infoMap = breadcrumbStore.useStore((s) => s.infoMap);
  const [query] = routeInfoStore.useStore((s) => [s.query]);

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
      } as IRoute;
      filteredRoutes.reverse().splice(1, 0, eternalApp);
      setAllRoutes(filteredRoutes.slice(0, -1));
    }
  }, [currentApp, routes]);

  const paths: string[] = [];

  const usefullBreadcrumb = allRoutes.filter((item) => {
    if (!item.breadcrumbName) {
      return false;
    }
    return !!getBreadcrumbTitle(item, true);
  });

  return (
    <div className="flex items-center flex-shrink-0 h-9 text-xs">
      {usefullBreadcrumb.map((item, i) => {
        const isLast = i === usefullBreadcrumb.length - 1;
        paths.push(getPath(item.path, params));

        const _title = getBreadcrumbTitle(item, true);

        return (
          <div key={item.key}>
            <BreadcrumbItem paths={[...paths]} route={item} params={params} title={_title} isLast={isLast} />
            {!isLast && <ErdaIcon className="align-middle mx-1 text-sub" type="right" size="14px" />}
          </div>
        );
      })}
    </div>
  );
};

export default ErdaBreadcrumb;
