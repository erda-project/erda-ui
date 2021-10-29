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
import { Button as NusiButton, Tooltip, Dropdown, Menu, Popconfirm } from 'antd';
import { isEmpty, map, find } from 'lodash';
import { useUnmount } from 'react-use';
import { Icon as CustomIcon } from 'common';
import { iconMap } from 'common/components/erda-icon';
import { DownOne as IconDownOne } from '@icon-park/react';

const fakeClick = 'fake-click';

const IconComp = (props: { type: string; [pro: string]: any }) => {
  const { type, ...rest } = props;
  const Comp = iconMap[type];
  if (Comp) {
    return <Comp {...rest} />;
  }
  return <CustomIcon type={type} {...rest} />;
};

export const Button = (props: CP_BUTTON.Props) => {
  const { updateState, customProps, execOperation, operations, props: configProps } = props;
  const {
    text,
    prefixIcon,
    suffixIcon,
    menu,
    tooltip,
    tipProps = {},
    visible = true,
    disabled: pDisabled,
    disabledTip: pDisabledTip,
    ...rest
  } = configProps || {};

  const timer = React.useRef();

  useUnmount(() => {
    timer.current && clearTimeout(timer.current);
  });

  const { disabledTip, disabled, confirm } = operations?.click || {};
  const onClick = () => {
    if (operations?.click && !disabled) {
      customProps?.click && customProps.click(operations.click);
      execOperation(operations.click);
    }
  };

  const content = (
    <>
      {prefixIcon ? <IconComp type={prefixIcon} className="mr-1" /> : null}
      {text}
      {suffixIcon ? (
        <IconComp type={suffixIcon} className="ml-1" />
      ) : isEmpty(menu) ? null : (
        <IconDownOne theme="filled" className="ml-1" />
      )}
    </>
  );

  React.useEffect(() => {
    // let data drive automatic refresh or not, when autoRefresh not exist, it will stop refresh
    const autoRefreshOp = operations?.autoRefresh;
    timer.current && clearTimeout(timer.current);
    if (autoRefreshOp) {
      timer.current = setTimeout(() => {
        execOperation(autoRefreshOp);
      }, autoRefreshOp.duration || 5000);
    }
  }, [operations]);

  if (!visible) return null;

  if (disabled || pDisabled) {
    return (
      <Tooltip title={disabledTip || pDisabledTip} {...tipProps}>
        <NusiButton {...rest} disabled>
          {content}
        </NusiButton>
      </Tooltip>
    );
  }

  if (!isEmpty(menu)) {
    const dropdownMenu = (
      <Menu
        onClick={(e: any) => {
          e.domEvent.stopPropagation();
          const curOp = find(menu, { key: e.key });
          if (curOp?.operations?.click) {
            execOperation(curOp.operations.click);
            customProps?.click && customProps.click(curOp.operations.click);
          }
        }}
      >
        {map(menu, (mItem) => {
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
                  <div>{mItem.text}</div>
                </Popconfirm>
              </Menu.Item>
            );
          }
          return (
            <Menu.Item key={mItem.key} disabled={mItem.disabled || curOp.disabled}>
              <Tooltip title={mItem.disabledTip || curOp.disabledTip}>
                <div className="flex items-center">
                  {mItem.prefixIcon ? <IconComp type={mItem.prefixIcon} /> : null}
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

  const buttonComp = confirm ? (
    <Popconfirm title={confirm} onConfirm={onClick}>
      <NusiButton {...rest}>{content}</NusiButton>
    </Popconfirm>
  ) : (
    <NusiButton {...rest} onClick={onClick}>
      {content}
    </NusiButton>
  );

  return tooltip ? (
    <Tooltip title={tooltip} {...tipProps}>
      {buttonComp}
    </Tooltip>
  ) : (
    buttonComp
  );
};
