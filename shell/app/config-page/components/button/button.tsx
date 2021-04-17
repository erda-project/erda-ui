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
import { Button as NusiButton, Tooltip, Dropdown, Menu, Popconfirm } from 'app/nusi';
import { isEmpty, map, find } from 'lodash';
import { Icon as CustomIcon } from 'common';

const fakeClick = 'fake-click';

export const Button = (props: CP_BUTTON.Props) => {
  const { updateState, customProps, execOperation, operations,
    props: configProps } = props;
  const { text, prefixIcon, suffixIcon, menu, tooltip, visible = true, disabled: pDisabled, disabledTip: pDisabledTip, ...rest } = configProps || {};

  const { disabledTip, disabled, confirm } = operations?.click || {};
  const onClick = () => {
    if (operations?.click && !disabled) {
      customProps?.click && customProps.click(operations.click);
      execOperation(operations.click);
    }
  };

  const content = (
    <>
      {prefixIcon ? <CustomIcon type={prefixIcon} className='mr4' /> : null}
      {text}
      {suffixIcon ? <CustomIcon type={suffixIcon} className='ml4' /> : (isEmpty(menu) ? null : <CustomIcon type={'di'} className='ml4' />)}
    </>
  );
  if (!visible) return null;

  if (disabled || pDisabled) {
    return <Tooltip title={disabledTip || pDisabledTip}><NusiButton {...rest} disabled>{content}</NusiButton></Tooltip>;
  }

  if (!isEmpty(menu)) {
    const dropdownMenu = (
      <Menu onClick={(e:any) => {
        e.domEvent.stopPropagation();
        const curOp = find(menu, { key: e.key });
        if (curOp?.operations?.click) {
          execOperation(curOp.operations.click);
          customProps?.click && customProps.click(curOp.operations.click);
        }
      }}
      >
        {map(menu, mItem => {
          const curOp = mItem.operations?.click || {};
          if (curOp.confirm && curOp.disabled !== true) {
            return (
              <Menu.Item key={`${fakeClick}-${mItem.key}`}>
                <Popconfirm
                  title={curOp.confirm}
                  onConfirm={() => {
                    execOperation(curOp);
                    customProps?.click && customProps.click(mItem.operations.click);
                  }}
                >
                  <span>{mItem.text}</span>
                </Popconfirm>
              </Menu.Item>
            );
          }
          return (
            <Menu.Item key={mItem.key} disabled={mItem.disabled || curOp.disabled}>
              <Tooltip title={mItem.disabledTip || curOp.disabledTip}>
                <div className='v-align'>
                  {mItem.prefixIcon ? <CustomIcon type={mItem.prefixIcon} /> : null}
                  {mItem.text}
                </div>
              </Tooltip>
            </Menu.Item>
          );
        })}
      </Menu>
    );
    return (
      <Dropdown overlay={dropdownMenu}>
        <NusiButton {...rest}>{content}</NusiButton>
      </Dropdown>
    );
  }

  const buttonComp =
    confirm ? (
      <Popconfirm title={confirm} onConfirm={onClick}>
        <NusiButton {...rest}>{content}</NusiButton>
      </Popconfirm>
    ) : (
      <NusiButton {...rest} onClick={onClick}>{content}</NusiButton>
    );


  return tooltip ? (
    <Tooltip title={tooltip}>
      {buttonComp}
    </Tooltip>
  ) : buttonComp;
};
