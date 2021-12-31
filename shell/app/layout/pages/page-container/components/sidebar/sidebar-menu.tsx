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
import { Menu, MenuProps } from 'antd';
import { map } from 'lodash';
export interface IMenu {
  key?: string;
  href: string;
  title?: string;
  text: string;
  subtitle?: string;
  icon: string | React.ReactNode;
  customIcon: Element;
  subMenu?: IMenu[];
  children?: IMenu[];
  jumpOut?: boolean;
  prefix?: string; // if page under this menu has different prefix of url, use this property get find active key
  withOpenKeys?: string[]; // enter one page expand other menu at the same time
  isActive?: (s: string) => boolean;
}

interface IProps extends MenuProps {
  openKeys: string[];
  selectedKey: string;
  dataSource: IMenu[];
  isFloat: boolean;
  extraNode: () => React.ReactElement;
  linkRender: (child: React.ReactNode, item: IMenu) => React.ReactNode;
}

const SidebarMenu = ({
  extraNode,
  openKeys,
  selectedKey,
  linkRender,
  dataSource,
  isFloat,
  onOpenChange,
  ...restProps
}: IProps) => {
  const renderChildrenMenu = (childList: IMenu[]) => {
    return map(childList, (child) => {
      const { icon, children, title, href } = child;
      if (children && children.length) {
        return (
          <Menu.SubMenu key={href} icon={icon} title={title}>
            {renderChildrenMenu(children)}
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item title={title} key={href} icon={icon}>
          {linkRender(title, child)}
        </Menu.Item>
      );
    });
  };
  return (
    <div className={`side-nav-menu flex-shrink-0 overflow-hidden ${isFloat ? 'float' : ''}`}>
      {extraNode()}
      <div className="flex-1 overflow-y-auto overflow-x-hidden h-full menu-container">
        <Menu openKeys={openKeys} selectedKeys={[selectedKey]} mode="inline" onOpenChange={onOpenChange} {...restProps}>
          {renderChildrenMenu(dataSource)}
        </Menu>
      </div>
    </div>
  );
};

export default SidebarMenu;
