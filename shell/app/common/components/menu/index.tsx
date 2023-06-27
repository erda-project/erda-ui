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
import classnames from 'classnames';
import { pick, isEmpty } from 'lodash';
import { isPromise, goTo as goToPath, qs, allWordsFirstLetterUpper } from 'common/utils';
import { useUpdate } from 'common/use-hooks';
import { getConfig } from 'core/config';
import breadcrumbStore from 'app/layout/stores/breadcrumb';

interface IMenuItem {
  key: string;
  name: string;
  title: string;
  isLetterUpper?: boolean;
  disabled?: boolean;
  split?: boolean;
  readonly?: boolean;
  isActive?: (v: string) => boolean;
  className?: string;
}

interface IMenu {
  activeKey: string;
  menus?: Array<{ key: string; name: string }> | Function;
  className?: string;
  TabRightComp?: typeof React.Component;
  beforeTabChange?: Function;
  [prop: string]: any;
}

const Menu = (props: IMenu) => {
  const { menus } = props;

  const [{ renderKey, reMenus }, updater, update] = useUpdate({
    renderKey: 1,
    reMenus: menus,
  });

  React.useEffect(() => {
    update((prev) => ({
      reMenus: menus,
      renderKey: prev.renderKey + 1,
    }));
    // 此处只监听menus，同时改变renderKey和reMenus，将不同menus分开渲染，否则menus中使用hooks会有问题
  }, [menus, update]);
  return <PureMenu key={renderKey} {...props} menus={reMenus} />;
};

const PureMenu = (props: IMenu) => {
  const {
    activeKey,
    menus,
    className = '',
    TabRightComp,
    beforeTabChange,
    ignoreTabQuery,
    keepTabQuery,
    ...rest
  } = props;
  const breadcrumbInfo = breadcrumbStore.useStore((s) => s);
  const { infoMap: breadcrumbInfoMap, params } = breadcrumbInfo;
  const { setCurrentParams } = breadcrumbStore.reducers;
  const finalMenus = typeof menus === 'function' ? menus({ ...props, breadcrumbInfoMap }) : menus;
  const history = getConfig('history');
  const { location = {} } = history || {};
  const { pathname = '' } = location;

  const currentParams = React.useMemo(() => {
    let _params = {};
    params.forEach((menu) => {
      const prefix = menu.prefix.split('undefined').join('');
      if (pathname.indexOf(prefix) !== -1) {
        _params = { ...menu.params };
      }
      menu.subMenu?.forEach((subMenu: Obj) => {
        const subPrefix = subMenu.prefix.split('undefined').join('');
        if (pathname.indexOf(subPrefix) !== -1) {
          _params = { ..._params, ...subMenu.params };
        }
      });
    });
    return _params;
  }, [params, pathname]);

  React.useEffect(() => {
    setCurrentParams(currentParams);
  }, [currentParams]);

  if (!finalMenus || !finalMenus.length) {
    return null;
  }
  const tabClass = classnames({
    'tab-menu': true,
    'tab-split-line-before': true,
    'flex-1': true,
    'min-w-0': true,
    [className]: !!className,
  });

  let query = window.location.search;
  if (ignoreTabQuery) {
    // 取消query
    query = '';
  } else if (!isEmpty(keepTabQuery)) {
    // 保留部分query
    query = qs.stringify(pick(qs.parse(window.location.search), keepTabQuery));
    query = query && `?${query}`;
  }

  const goTo = (path: string) => {
    if (typeof beforeTabChange === 'function') {
      const from = {
        pathname: window.location.pathname,
        search: window.location.search,
      };
      const result = beforeTabChange(from);
      if (isPromise(result)) {
        return result.then(() => {
          goToPath(path, { encode: true });
        });
      }
    }
    return goToPath(path, { encode: true });
  };

  const handleClick = (currentKey: string, targetKey: string) => {
    const { pathname } = window.location;
    // 可能存在路由中匹配多个currentKey，故split后假如length>1则删除最后一个后再拼
    const pathArr = pathname.split(currentKey);
    pathArr.length > 1 && pathArr.pop();
    const basePath = pathArr.join(currentKey);
    const newPath = `${basePath}/${targetKey}`;
    const concatPath = `${newPath}${query}`.replace(/\/{2,}/, '/'); // 避免路由中多个连续的/
    goTo(concatPath);
  };

  const splitIndex = finalMenus.findIndex((menu: IMenuItem) => menu.split);

  const renderMenu = (menu: IMenuItem) => {
    const { disabled, key, name, isLetterUpper = true, split, readonly, isActive, className: itemClass = '' } = menu;
    let { title } = menu;
    title = title ?? (isLetterUpper ? allWordsFirstLetterUpper(name) : name);
    const menuItemClass = classnames({
      'tab-menu-item': true,
      'tab-menu-disabled': disabled,
      'tab-split-line-before': split,
      active: isActive ? isActive(activeKey) : activeKey === key,
      [itemClass]: !!itemClass,
    });

    const targetKey = key
      .split('/')
      .map((_key) => {
        if (_key.indexOf(':') !== -1) {
          return currentParams[_key.split(':').join('')];
        }
        return _key;
      })
      .join('/');

    return (
      <li
        key={key}
        className={menuItemClass}
        onClick={() => {
          if (!readonly && !disabled && activeKey !== key) {
            // click current not trigger
            handleClick(activeKey, targetKey);
          }
        }}
      >
        {title}
      </li>
    );
  };

  return (
    <div className={tabClass}>
      <ul className="tab-item-wraps flex w-full whitespace-nowrap">
        <div>{finalMenus.slice(0, splitIndex !== -1 ? splitIndex : 0).map((menu: IMenuItem) => renderMenu(menu))}</div>
        <div className="flex-1 overflow-x-auto tab-scroll-container">
          {finalMenus.slice(splitIndex !== -1 ? splitIndex : undefined).map((menu: IMenuItem) => renderMenu(menu))}
        </div>
      </ul>
      {TabRightComp ? (
        <div className="tab-menu-right">
          <TabRightComp {...rest} />
        </div>
      ) : null}
    </div>
  );
};

export default Menu;
