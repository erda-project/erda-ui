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
import { Popconfirm, Tooltip } from 'antd';
import classnames from 'classnames';
import { WithAuth } from 'user/common';
import { colorMap, newColorMap } from 'app/charts/theme';

interface IOperationAction {
  operation?: CP_COMMON.Operation;
  operations?: CP_COMMON.Operation;
  children: React.ReactElement;
  onClick: (e?: any) => void;
  tipProps?: Obj;
  tip?: string;
}
export const OperationAction = (props: IOperationAction) => {
  const { operation, children, onClick, tipProps, operations, tip } = props;
  if (!operation && !operations) return <Tooltip title={tip}>{children}</Tooltip>;
  let curOp: CP_COMMON.Operation = operation;
  if (operations) {
    const clickOp = map(filterClickOperations(operations));
    if (clickOp[0]) {
      curOp = clickOp[0];
    }
  }
  const curTip = curOp.disabledTip || curOp.tip || tip;
  if (curOp.disabled === true) {
    // 无权限操作
    return (
      <WithAuth noAuthTip={curTip} key={curOp.key} pass={false} tipProps={tipProps}>
        {children}
      </WithAuth>
    );
  } else if (curOp.confirm) {
    // 需要确认的操作
    return (
      <Popconfirm
        title={curOp.confirm}
        arrowPointAtCenter
        placement="topRight"
        onConfirm={(e) => {
          e && e.stopPropagation();
          onClick(e);
        }}
        key={curOp.key}
        onCancel={(e) => e && e.stopPropagation()}
      >
        {React.cloneElement(children, {
          onClick: (e: MouseEvent) => e.stopPropagation(),
        })}
      </Popconfirm>
    );
  } else {
    // 普通的操作
    return (
      <Tooltip title={curTip}>
        {React.cloneElement(children, {
          key: curOp.key,
          onClick: (e: MouseEvent) => {
            e.stopPropagation();
            onClick(e);
          },
        })}
      </Tooltip>
    );
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

export { colorMap, newColorMap };

export const statusColorMap = {
  success: colorMap.green,
  warning: colorMap.orange,
  error: colorMap.red,
  danger: colorMap.maroon,
  info: colorMap.blue,
  processing: colorMap.blue,
  normal: colorMap.purple,
  defaut: colorMap.gray,
};

export const textColorMap = {
  ...colorMap,
  'text-main': 'rgba(0, 0, 0, 0.8)',
  'text-sub': 'rgba(0, 0, 0, 0.6)',
  'text-desc': 'rgba(0, 0, 0, 0.4)',
};

export const getClass = (props: Obj) => {
  return classnames({
    'bg-white': props?.whiteBg,
    'bg-black-02': props?.grayBg,
    'h-full': props?.fullHeight,
    'w-full': props?.fullWidth,
    'flex items-center justify-center': props?.flexCenter,
  });
};

export const getFormatterString = (temp: string, obj: Obj) => {
  return temp.replace(/\{(\w+)\}/g, (match, key) => obj[key]);
};

export const execMultipleOperation = (
  operations: Obj<CP_COMMON.Operation>,
  execOperation: (op: CP_COMMON.Operation) => void,
) => {
  Object.keys(operations || {}).forEach((opKey) => {
    execOperation({ key: opKey, ...operations[opKey] });
  });
};

export const filterClickOperations = (operations: Obj<CP_COMMON.Operation>) => {
  const clickOps = {};
  map(operations, (op, key) => {
    if (key.startsWith('click')) {
      clickOps[key] = op;
    }
  });
  return clickOps;
};
