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
import { map } from 'lodash';
import { Popconfirm } from 'core/nusi';
import { WithAuth } from 'user/common';

interface IOperationAction {
  operation: CP_COMMON.Operation;
  children: React.ReactElement;
  onClick: (e?: any) => void;
}
export const OperationAction = (props: IOperationAction) => {
  const { operation, children, onClick } = props;
  const { confirm, disabled, disabledTip, key } = operation;
  if (disabled === true) {
    // 无权限操作
    return (
      <WithAuth noAuthTip={disabledTip} key={key} pass={false}>
        {children}
      </WithAuth>
    );
  } else if (confirm) {
    // 需要确认的操作
    return (
      <Popconfirm
        title={confirm}
        arrowPointAtCenter
        placement="topRight"
        onConfirm={(e) => {
          e && e.stopPropagation();
          onClick(e);
        }}
        key={key}
        onCancel={(e) => e && e.stopPropagation()}
      >
        {React.cloneElement(children, {
          onClick: (e: MouseEvent) => e.stopPropagation(),
        })}
      </Popconfirm>
    );
  } else {
    // 普通的操作
    return React.cloneElement(children, {
      key,
      onClick: (e: MouseEvent) => {
        e.stopPropagation();
        onClick(e);
      },
    });
  }
};

// TODO: 3.21版本中，协议上还未定义一个参数取关联url查询参数，现在是放在各自组件的state中，用cId__urlQuery来标识，后续这里要改成协议最外层的一个固定key；
export const getUrlQuery = (val: Obj) => {
  const _urlQuery = {};
  map(val, (v, k) => {
    if (k.includes('__urlQuery')) {
      _urlQuery[k] = v;
    }
  });
  return _urlQuery;
};

export const colorMap = {
  green: '#34b37e',
  purple: '#6a549e',
  orange: '#f47201',
  red: '#df3409',
  brown: '#A98C72',
  steelBlue: '#4E6097',
  yellow: '#F7C36B',
  lightgreen: '#8DB36C',
  darkcyan: '#498e9e',
  darksalmon: '#DE6F57',
  darkslategray: '#2F4F4F',
  maroon: '#800000',
  darkseagreen: '#8FBC8F',
  darkslateblue: '#483D8B',
  darkgoldenrod: '#B8860B',
  teal: '#008080',
  gray: '#666666',
};

export const statusColorMap = {
  success: colorMap.green,
  warning: colorMap.orange,
  error: colorMap.red,
  danger: colorMap.maroon,
  normal: colorMap.purple,
  defaut: colorMap.gray,
};
