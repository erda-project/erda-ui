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
import type { IMenu } from './sidebar-menu';
import SidebarMenu from './sidebar-menu';
import { Link } from 'react-router-dom';
import layoutStore from 'layout/stores/layout';
import routeInfoStore from 'core/stores/route';
import MenuHeader from './menu-head';
import { isEmpty, isEqual, pickBy } from 'lodash';
import { qs } from 'common/utils';
import { useUpdate } from 'common/use-hooks';
import { ErdaIcon } from 'common';
import './index.scss';

const { stringify, parseUrl } = qs;

const linkRender = (children: React.ReactNode, { href, jumpOut, children: childMenu = [] }: IMenu) => {
  if (childMenu.length !== 0) {
    return children;
  }
  return jumpOut ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ cursor: 'alias' }}>
      {children}
    </a>
  ) : (
    <Link to={href}>{children}</Link>
  );
};

const removeQuery = (menu: IMenu[]) => {
  return menu.map((item) => {
    return {
      ...item,
      href: item.href.split('?')[0],
    };
  });
};

const removeEmptyQuery = (href: string) => {
  const { query, url } = parseUrl(href);
  const queryString = stringify(pickBy(query, (v: any) => v !== ''));
  return `${url}${queryString ? `?${queryString}` : ''}`;
};

const firstLetterUpper = (str: string) => str.slice(0, 1).toUpperCase() + str.slice(1);

const findActiveKey = (menu: IMenu[], curHref: string) => {
  const { pathname } = window.location;
  let activeKey = '';
  let realParentActiveKeyList = [] as string[];
  const getActiveKey = (menuNext: IMenu[], parentKey: string, activeParentList: string[]) => {
    const tmpParentActiveKeyList: string[] = [];
    menuNext.forEach(({ href, isActive, prefix, subMenu }) => {
      parentKey && !tmpParentActiveKeyList.includes(parentKey) && tmpParentActiveKeyList.push(parentKey);
      if (subMenu) getActiveKey(subMenu, href, tmpParentActiveKeyList);
      if ((isActive ? isActive(pathname) : pathname.startsWith(prefix || href)) && !subMenu) {
        realParentActiveKeyList = Array.from(new Set([...activeParentList, ...tmpParentActiveKeyList]));
        // match the longest href
        if (activeKey) {
          activeKey = activeKey.length > href.length ? activeKey : href;
        } else {
          activeKey = href;
        }
      }
    });
  };
  getActiveKey(menu, curHref, []);
  return [activeKey, realParentActiveKeyList];
};

const compareSameMenu = (sourceMenu: IMenu[], targetMenu: IMenu[]) => {
  const getMenuHref = (_menu: IMenu[]) => {
    return _menu.map((item) => {
      return { href: item.href, children: item.children ? getMenuHref(item.children) : [] };
    });
  };
  return JSON.stringify(getMenuHref(sourceMenu)) === JSON.stringify(getMenuHref(targetMenu));
};

const SideBar = () => {
  const [subSiderInfoMap, subList] = layoutStore.useStore((s) => [s.subSiderInfoMap, s.subList]);
  const routeMarks = routeInfoStore.useStore((s) => s.routeMarks);
  const [state, updater, update] = useUpdate({
    float: localStorage.getItem('sidebarFixed') === 'false',
    menus: [],
    openKeys: [],
    selectedKey: '',
  });
  let siderInfo: any = null;
  routeMarks
    .slice()
    .reverse()
    .forEach((mark: string) => {
      if (subSiderInfoMap[mark]) {
        siderInfo = { ...subSiderInfoMap[mark] };
      }
    });
  if (siderInfo) {
    if (!siderInfo.detail && siderInfo.getDetail) {
      siderInfo.detail = siderInfo.getDetail();
    }
  }

  const organizeInfo = (menu: IMenu[]) => {
    let activeKeyList = [] as string[];
    let selectedKey = '';
    const fullMenu: IMenu[] = menu.map((item: IMenu) => {
      let { subMenu = [], href } = item;
      href = href.split('?')[0];
      if (isEmpty(subMenu) && item.key && subList[item.key]) {
        subMenu = removeQuery(subList[item.key]) as any;
      }
      const getAllSubMenu = (subMenuNext: IMenu[]): IMenu[] => {
        let subMenuNextChildren = [] as IMenu[];

        return subMenuNext.map((sub: IMenu) => {
          if (sub.subMenu) {
            subMenuNextChildren = getAllSubMenu(sub.subMenu);
            return {
              ...sub,
              title: firstLetterUpper(sub.text),
              href: removeEmptyQuery(sub.href),
              children: subMenuNextChildren,
            };
          }
          return {
            ...sub,
            title: firstLetterUpper(sub.text),
            href: removeEmptyQuery(sub.href),
          };
        });
      };

      subMenu = getAllSubMenu(subMenu);
      const [subActiveKey, parentActiveKeyList] = findActiveKey(subMenu as IMenu[], href);
      if (subActiveKey) {
        selectedKey = subActiveKey as string;
        activeKeyList = parentActiveKeyList as string[];
      }
      const IconComp = () => item.icon as React.ReactElement;
      return {
        ...item,
        title: firstLetterUpper(item.text),
        icon: item.icon || item.customIcon || null,
        href,
        children: subMenu,
        subActiveKey,
      };
    });
    // 二级有高亮，则父级也高亮，二级都没有时从一级找
    activeKeyList = activeKeyList.length ? activeKeyList : [findActiveKey(fullMenu, '')[0] as string];
    return { activeKeyList, fullMenu, selectedKey: selectedKey || activeKeyList[0] };
  };

  const { menu = [] } = siderInfo || {};
  React.useEffect(() => {
    const { activeKeyList, fullMenu, selectedKey } = organizeInfo(menu);
    if (!compareSameMenu(fullMenu, state.menus) || selectedKey !== state.selectedKey) {
      update({
        menus: fullMenu,
        openKeys: (localStorage.getItem('isSubSidebarFold') !== 'true' && activeKeyList) || [],
        selectedKey,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu, subList, window.location.pathname]);

  const handleSelect = ({ key }: { key: React.Key }) => {
    update({
      selectedKey: key as string,
    });
  };
  const handleOpen = (openKeys: React.Key[]) => {
    update({
      openKeys: openKeys as string[],
    });
  };

  const handleToggleFixed = (newFlag: boolean) => {
    localStorage.setItem('sidebarFixed', `${!newFlag}`);
    layoutStore.reducers.toggleSideFold(!newFlag);
    updater.float(newFlag);
  };

  return (
    <>
      <div className={`erda-sidebar-trigger ${state.float ? 'float' : ''}`}>
        <div className="toggle-btn inline-flex items-center justify-center">
          <ErdaIcon
            className="icon cursor-pointer p-1"
            type={state.float ? 'erjicaidan' : 'zuofan'}
            size={20}
            onClick={() => handleToggleFixed(!state.float)}
          />
          <ErdaIcon
            className="icon cursor-pointer p-1 absolute hover-show"
            type="youfan"
            size={20}
            onClick={() => handleToggleFixed(!state.float)}
          />
        </div>
        <SidebarMenu
          openKeys={state.openKeys}
          selectedKey={state.selectedKey}
          onSelect={handleSelect}
          onOpenChange={handleOpen}
          extraNode={() => <MenuHeader siderInfo={siderInfo} routeMarks={routeMarks} />}
          dataSource={state.menus}
          linkRender={linkRender}
          isFloat={!state.float}
        />
      </div>
    </>
  );
};

export default SideBar;
