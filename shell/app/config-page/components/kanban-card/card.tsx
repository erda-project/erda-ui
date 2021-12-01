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
import { Icon as CustomIcon, Ellipsis, Badge } from 'common';
import { Dropdown, Menu, Popconfirm, Tooltip } from 'antd';
import { isString, isEmpty, map } from 'lodash';
import { WithAuth } from 'user/common';
import { useDrag } from 'react-dnd';
import { More as IconMore } from '@icon-park/react';
import classnames from 'classnames';
import './card.scss';

const fakeClick = 'fake-click';
const noop = () => {};

export const Card = (props: CP_CARD.Props) => {
  const { props: configProps, execOperation = noop, customOp = {} } = props;

  const { cardType, data, className = '', setIsDrag, isDrag, stringMaxLength = 36 } = configProps;

  const { clickNode = noop } = customOp;
  const [isHover, setIsHover] = React.useState(false);
  const { id, titleIcon, title, operations, subContent, description, extraInfo } = data?._infoData || {};
  const isTitleExceeds = isString(title) && title.length > stringMaxLength;
  const { drag: dragOperation, ...menuOperations } = operations || {};
  const [dragObj, drag] = useDrag({
    item: { type: cardType, data },
    canDrag: () => {
      return dragOperation && !dragOperation.disabled && !isHover;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  React.useEffect(() => {
    if (setIsDrag) {
      setIsDrag(dragObj.isDragging);
    }
  }, [dragObj.isDragging]);

  const opRef = React.useRef(null);

  const onClick = (k: string) => {
    if (!k.startsWith(fakeClick)) {
      execOperation({ ...((operations && operations[k]) || {}), key: k, reload: true });
    }
  };

  const getMenu = () => {
    return (
      <Menu
        onClick={(e: any) => {
          e.domEvent.stopPropagation();
          onClick(e.key);
        }}
      >
        {map(menuOperations, (item, key) => {
          if (item.disabled) {
            return (
              <Menu.Item key={key}>
                <WithAuth pass={false} key={key} noAuthTip={item.disabledTip}>
                  <span>{item.text}</span>
                </WithAuth>
              </Menu.Item>
            );
          }
          if (item.confirm) {
            return (
              <Menu.Item key={`${fakeClick}-${key}`}>
                <Popconfirm title={item.confirm} onConfirm={() => onClick(key)}>
                  <span>{item.text}</span>
                </Popconfirm>
              </Menu.Item>
            );
          }
          return <Menu.Item key={key}>{item.text}</Menu.Item>;
        })}
      </Menu>
    );
  };
  const cls = classnames({
    'drag-wrap': true,
    dragging: dragObj && dragObj.isDragging,
    'dice-cp': true,
    'info-card': true,
    rounded: true,
    'hover-active-bg': true,
    'border-all': true,
  });

  return (
    <div className={`${className} ${cls} boxShadow-card`} onClick={() => clickNode(data)}>
      <div className="info-card-content p-2" key={id} ref={drag}>
        <div className={'flex justify-between items-start mb-1'}>
          {isString(titleIcon) ? <CustomIcon type={titleIcon} color className="head-icon mr-1" /> : titleIcon || null}
          {/* <div className="flex-1 text-sm text-default break-word w-64">{title}</div> */}
          <Tooltip destroyTooltipOnHide title={isTitleExceeds ? title : ''} className="flex-1 text-sm text-default break-word w-64">
            {isTitleExceeds ? `${title.slice(0, stringMaxLength)}...` : title}
          </Tooltip>
        </div>
        {isString(subContent) ? <div className="text-xs text-sub mb-3">{subContent}</div> : subContent || null}
        {isString(description) ? (
          <Tooltip title={description}>
            <div className="text-xs nowrap text-desc">{description}</div>
          </Tooltip>
        ) : (
          description || null
        )}
        {extraInfo}
      </div>
    </div>
  );
};
