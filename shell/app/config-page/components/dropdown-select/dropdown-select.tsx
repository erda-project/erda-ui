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

const DropdownSelect = (props: CP_DROPDOWN_SELECT.Props) => {
  const { props: configProps } = props;
  const { menuList, jumpToOtherPage = [], onClickMenu, overlay, trigger, buttonText, loading = false, children, btnProps, ...restProps } = configProps;
  let _overlay = overlay;
  const [filterValue, setFilterValue] = React.useState('');
  const [active, setActive] = React.useState(false)

  React.useEffect(() => {
    // 控制点击外部关闭 dropdown
    const handleCloseDropdown = (e: MouseEvent) => {

      const dropdowns = Array.from(
        document.querySelectorAll('.dropdown-select')
      );
      const node = e.target as Node;
      const inner = dropdowns
        .some((wrap) => wrap.contains(node));

      if (!inner) {
        setActive(false);
      }
    };

    document.body.addEventListener('click', handleCloseDropdown);

    return () => document.body.removeEventListener('click', handleCloseDropdown);
  }, []);

  if (menuList) {
    _overlay = (
      <Menu>
        <Menu.Item>
          <Input
            autoFocus
            size="small"
            placeholder={i18n.t('common:search')}
            prefix={<CustomIcon type="search" />}
            value={filterValue}
            onChange={e => setFilterValue(e.target.value)}
          />
        </Menu.Item>

        <Menu.Divider key='divider1' />
        {
          map(menuList, (item: CP_DROPDOWN_SELECT.IMenuItem) => {
            // 前端搜索
            if (!item.name.toLowerCase().includes(filterValue)) {
              return null
            }

            return (
              <Menu.Item key={item.key} disabled={item.disabled} onClick={() => {
                setActive(false)
                onClickMenu && onClickMenu(item)
              }}>
                <div className="flex-box full-width">
                  <span>{item.name}</span>
                  <span>
                    {buttonText === item.name ? <CustomIcon type='duigou' className='color-success ml8' /> : null}
                  </span>
                </div>
              </Menu.Item>
            )
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
      overlayClassName="dropdown-select"
      overlay={_overlay}
      visible={active}
      trigger={trigger || ['click']}
      {...restProps}
    >
      {children || (
        <Button
          type="default"
          loading={loading}
          {...btnProps}
          onClick={() => setActive(!active)}
        >
          {buttonText}
          <CustomIcon style={{ color: 'inherit' }} type="caret-down" />
        </Button>
      )}
    </Dropdown>
  );
};

export default DropdownSelect;