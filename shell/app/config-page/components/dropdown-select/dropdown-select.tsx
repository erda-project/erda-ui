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

import { Button, Dropdown, Menu, Input } from 'nusi';
import { Icon as CustomIcon } from 'common';
import React from 'react';
import { map } from 'lodash';
import i18n from 'i18n';

const { SubMenu } = Menu;

// interface IProps {
//   [propName: string]: any,
//   buttonText?: string,
//   btnProps?: object,
//   overlay?: any,
//   menuList?: IMenuItem[],
//   loading?: boolean;
//   trigger?: Array<'click' | 'hover' | 'contextMenu'>,
//   onClickMenu?(item: ClickParam): void,
// }

// interface IMenuItem {
//   key: string,
//   name: string,
//   disabled?: boolean,
//   children?: IMenuItem[],
// }

const DropdownSelect = (props: CP_DROPDOWN_SELECT.Props) => {
  const { props: configProps } = props;
  const { menuList, jumpToOtherPage = [], onClickMenu, overlay, trigger, buttonText, loading = false, children, btnProps, ...restProps } = configProps;
  let _overlay = overlay;
  const [filterValue, setFilterValue] = React.useState('');


  if (menuList) {
    _overlay = (
      <Menu onClick={onClickMenu}>
        <Input
          autoFocus
          size="small"
          placeholder={i18n.t('common:search')}
          prefix={<CustomIcon type="search" />}
          value={filterValue}
          onChange={e => setFilterValue(e.target.value)}
        />
        <Menu.Divider key='divider1' />
        {
          map(menuList, (item: CP_DROPDOWN_SELECT.IMenuItem, key: string) => {
            if (item.children) {
              return (
                <SubMenu key={key} title={item.name}>
                  {
                    map(item.children, (subItem: CP_DROPDOWN_SELECT.IMenuItem) => <Menu.Item key={subItem.key} disabled={subItem.disabled}>{subItem.name}</Menu.Item>)
                  }
                </SubMenu>
              );
            } else {
              return <Menu.Item key={item.key} disabled={item.disabled}>{item.name}</Menu.Item>;
            }
          })
        }
        <Menu.Divider key='divider2' />
        {
          jumpToOtherPage.length > 0 ?
            map(jumpToOtherPage, (item: string) => (
              <Menu.Item>
                {item}
              </Menu.Item>
            )) : null
        }
      </Menu>
    );
  }
  return (
    <Dropdown
      overlay={_overlay}
      trigger={trigger || ['click']}
      {...restProps}
    >
      {children || (
        <Button type="default" loading={loading} {...btnProps}>
          {buttonText}
          <CustomIcon style={{ color: 'inherit' }} type="caret-down" />
        </Button>
      )}
    </Dropdown>
  );
};

export default DropdownSelect;