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
import { SideNavigation } from 'app/nusi';
import { Link } from 'react-router-dom';
import layoutStore from 'layout/stores/layout';
import routeInfoStore from 'common/stores/route';
import { MenuConfigItemProps, Theme } from 'core/common/interface';
import MenuHeader from './menu-head';
import { isEmpty, isEqual, pickBy } from 'lodash';
import { qs } from 'common/utils';        
import { Icon as CustomIcon, useUpdate } from 'common';
import './sub-sidebar.scss';

const { stringify, parseUrl } = qs;

const linkRender = (_linkTo: string, children: React.ReactNode, { href, jumpOut, children: childMenu = [] }: MenuConfigItemProps) => {
  if (childMenu.length !== 0) {
    return children;
  }
  return jumpOut ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ cursor: 'alias' }}>
      {children}
    </a>
  ) : (
    <Link className="dice-sidebar-menu-item" to={href} >
      {children}
    </Link>
  );
};

interface IMenu {
  key?: string;
  href: string;
  title?: string;
  text: string;
  icon: string | React.ReactNode;
  customIcon: Element;
  subMenu?: IMenu[];
  children?: IMenu[];
  prefix?: string; // if page under this menu has different prefix of url, use this property get find active key
  isActive?(s: string): boolean;
}
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

const findActiveKey = (menu: IMenu[]) => {
  const { pathname } = window.location;
  let activeKey = '';
  menu.forEach(({ href, isActive, prefix }) => {
    if (isActive ? isActive(pathname) : pathname.startsWith(prefix || href)) {
      // match the longest href
      if (activeKey) {
        activeKey = activeKey.length > href.length ? activeKey : href;
      } else {
        activeKey = href;
      }
    }
  });
  return activeKey;
};

const SubSideBar = () => {
  const [subSiderInfoMap, subList] = layoutStore.useStore(s => [s.subSiderInfoMap, s.subList]);
  const routeMarks = routeInfoStore.useStore(s => s.routeMarks);
  const { toggleSideFold } = layoutStore.reducers;
  const [state, , update] = useUpdate({
    menus: [],
    openKeys: [],
    selectedKey: '',
  });
  let siderInfo: any = null;
  routeMarks.slice().reverse().forEach((mark: string) => {
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
    let activeKey = '';
    let selectedKey = '';
    const fullMenu: IMenu[] = menu.map((item: IMenu) => {
      let { subMenu = [], href } = item;
      href = href.split('?')[0];
      if (isEmpty(subMenu) && item.key && subList[item.key]) {
        subMenu = removeQuery(subList[item.key]) as any;
      }
      subMenu = subMenu.map((sub: IMenu) => {
        return {
          ...sub,
          title: firstLetterUpper(sub.text),
          href: removeEmptyQuery(sub.href),
        };
      });
      const subActiveKey = findActiveKey(subMenu as IMenu[]);
      if (subActiveKey) {
        selectedKey = subActiveKey;
        activeKey = href;
      }

      return {
        ...item,
        title: firstLetterUpper(item.text),
        icon: (item.icon && typeof item.icon !== 'string') ?  item.icon : item.customIcon ? item.customIcon : null,
        href,
        children: subMenu,
        subActiveKey,
      };
    });
    // 二级有高亮，则父级也高亮，二级都没有时从一级找
    activeKey = activeKey || findActiveKey(fullMenu);
    return { activeKey, fullMenu, selectedKey: selectedKey || activeKey };
  };

  const { menu = [] } = siderInfo || {};
  React.useEffect(() => {
    const { activeKey, fullMenu, selectedKey } = organizeInfo(menu);
    if (!isEqual(fullMenu, state.menus) || selectedKey !== state.selectedKey) {
      update({
        menus: fullMenu,
        openKeys: [activeKey],
        selectedKey,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu, subList, window.location.pathname]);

  const handleTitleClick = ({ openKeys, selectedKey }: { openKeys: string[], selectedKey: string }) => {
    update({
      openKeys,
      selectedKey,
    });
  };

  return (
    <SideNavigation
      theme={'light' as Theme.LIGHT} // 从core中导入的type只能作为定义使用
      menuKey="href"
      searchBar={false}
      openKeys={state.openKeys}
      selectedKey={state.selectedKey}
      onTitleClick={handleTitleClick}
      extraNode={<MenuHeader siderInfo={siderInfo} routeMarks={routeMarks} />}
      dataSource={state.menus}
      linkRender={linkRender}
      onFold={toggleSideFold}
    />
  );
};

export default SubSideBar;
