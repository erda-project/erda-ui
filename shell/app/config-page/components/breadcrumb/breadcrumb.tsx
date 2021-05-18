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

import * as React from 'react';
import { Breadcrumb, Ellipsis, Menu } from 'app/nusi';
import { map } from 'lodash';

const noop = () => {};
export default (props: CP_BREADCRUMB.Props) => {
  const { data, operations, execOperation, props: configProps } = props;
  const { list = [] } = data || {};
  const { visible = true } = configProps || {};

  const onClickItem = (key: string) => {
    operations?.click && execOperation(operations.click, key);
  };

  if (!visible) return null;
  return (
    <Breadcrumb>
      {
        map(list, (item, idx) => {
          if (item.menus) {
            const menu = (
              <Menu>
                {
                  item.menus.map(i => (
                    <Menu.Item key={i.key}>
                      <span className={'pointer'} onClick={() => onClickItem(i.key)}>{i.item}</span>
                    </Menu.Item>
                  ))
                }
              </Menu>
            );
            const activeItem = item.menus.find(i => i.key === item.activeKey);
            return (
              <Breadcrumb.Item key={item.key} overlay={menu}>
                <span className={'pointer'} onClick={() => onClickItem(item.key)}>{activeItem.item || ''}</span>
              </Breadcrumb.Item>
            );
          }
          const [cls, onClick] = idx !== list.length - 1 ? ['pointer', () => onClickItem(item.key)] : ['', noop];
          return <Breadcrumb.Item key={item.key}><span className={cls} onClick={onClick}><Ellipsis title={item.item}>{item.item}</Ellipsis></span></Breadcrumb.Item>;
        })
      }
    </Breadcrumb>
  );
};
