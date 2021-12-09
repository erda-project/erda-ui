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
import { Icon as CustomIcon } from 'common';
import { Tooltip } from 'antd';
import { isString } from 'lodash';
import { useDrag } from 'react-dnd';
import classnames from 'classnames';
import './card.scss';

const noop = () => {};
const DEFAULT_TITLE_MAX_LENGTH = 36;

export const Card = (props: CP_CARD.Props) => {
  const { props: configProps, execOperation = noop, customOp = {} } = props;

  const { cardType, data, className = '', setIsDrag, titleMaxLength = DEFAULT_TITLE_MAX_LENGTH } = configProps;

  const { clickNode = noop } = customOp;
  const { id, titleIcon, title, operations, subContent, description, extraInfo } = data?._infoData || {};
  const isTitleExceeds = isString(title) && title.length > titleMaxLength;
  const { drag: dragOperation } = operations || {};
  const [dragObj, drag] = useDrag({
    item: { type: cardType, data },
    canDrag: () => {
      return dragOperation && !dragOperation.disabled;
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
      <div className="info-card-content px-4 py-3" key={id} ref={drag}>
        <div className={'flex justify-between items-start mb-1'}>
          {isString(titleIcon) ? <CustomIcon type={titleIcon} color className="head-icon mr-1" /> : titleIcon || null}

          <Tooltip
            destroyTooltipOnHide
            title={isTitleExceeds ? title : ''}
            className="flex-1 text-sm text-default break-word w-64"
          >
            {isTitleExceeds ? `${title.slice(0, titleMaxLength)}...` : title}
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
