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

import { Dropdown, Menu, Input } from 'app/nusi';
import { Icon as CustomIcon } from 'common';
import { goTo } from 'app/common/utils';
import React from 'react';
import { map, get } from 'lodash';
import i18n from 'i18n';
import './dropdown-select.scss';

const DropdownSelect = (props: CP_DROPDOWN_SELECT.Props) => {
  const { execOperation, props: configProps, state: propsState } = props;
  const { options, quickSelect = [], overlay, trigger, visible, ...restProps } = configProps;
  let _overlay = overlay;
  const [value, setValue] = React.useState(propsState.value)
  const [filterValue, setFilterValue] = React.useState('');
  const [active, setActive] = React.useState(false)

  const label = React.useMemo(() => get(options?.find(item => item.value === value), 'label', ''), [value])

  const gotoSpecificPage = (item: CP_DROPDOWN_SELECT.IQuickSelect) => {
    item?.operations && item?.operations?.click && execOperation(item.operations.click)
  }

  React.useEffect(() => {
    // 控制点击外部关闭 dropdown
    const handleCloseDropdown = (e: MouseEvent) => {
      const dropdowns = Array.from(
        document.querySelectorAll('.dropdown-select')
      );
      const dropdownButton = document.querySelector('.dropdown-select-button')
      const node = e.target as Node;
      const inner = dropdowns
        .some((wrap) => wrap.contains(node));

      if (!inner && node !== dropdownButton) {
        setActive(false);
      }
    };

    document.body.addEventListener('click', handleCloseDropdown);

    return () => document.body.removeEventListener('click', handleCloseDropdown);
  }, []);

  if (options) {
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
          map(options, (item: CP_DROPDOWN_SELECT.IOptionItem) => {
            // 前端搜索
            if (!item.label.toLowerCase().includes(filterValue)) {
              return null
            }

            return (
              <Menu.Item
                key={item.label}
                disabled={item.disabled}
                className='hover-active'
                onClick={() => {
                  setActive(false);
                  if (item.operations?.click) {
                    execOperation(item.operations.click, item)
                  }
                }
                }>
                <div className="flex-box full-width">
                  <span>
                    {item.prefixIcon ? <CustomIcon type={item.prefixIcon} /> : null}
                    {item.prefixImgSrc ? <img src={item.prefixImgSrc} className='cp-dice-dropdown-select-image mr8' /> : null}
                    {item.label}
                  </span>
                  <span>
                    {value === item.value ? <CustomIcon type='duigou' className='color-primary ml8' /> : null}
                  </span>
                </div>
              </Menu.Item>
            )
          })
        }
        <Menu.Divider key='divider2' />
        {
          quickSelect.length > 0 ?
            map(quickSelect, (item) => (
              <Menu.Item
                className='hover-active'
                onClick={() => gotoSpecificPage(item)}>
                {item?.label || null}
              </Menu.Item>
            )) : null
        }
      </Menu>
    );
  }

  if (!visible) {
    return null;
  }

  return (
    <Dropdown
      className="cp-dice-dropdown-select"
      overlay={_overlay}
      visible={active}
      trigger={trigger || ['click']}
      {...restProps}
    >
      <span
        className='dropdown-select-button hover-active' onClick={() => setActive(!active)}>
        {label}
        <CustomIcon style={{ color: 'inherit' }} type="caret-down" />
      </span>

    </Dropdown>
  );
};

export default DropdownSelect;