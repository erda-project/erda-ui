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
import { Breadcrumb, Ellipsis } from 'nusi';
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
            return <Breadcrumb.Menu key={item.key} activeKey={item.activeKey} menuOptions={item.menus} onSelect={(e: any) => onClickItem(e.key)} />;
          }
          const [cls, onClick] = idx !== list.length - 1 ? ['pointer', () => onClickItem(item.key)] : ['', noop];
          return <Breadcrumb.Item key={item.key}><span className={cls} onClick={onClick}><Ellipsis title={item.item}>{item.item}</Ellipsis></span></Breadcrumb.Item>;
        })
      }
    </Breadcrumb>
  );
};
