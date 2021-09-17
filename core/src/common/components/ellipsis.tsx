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

import React, { useState, useRef, useCallback } from 'react';
import { Tooltip } from 'nusi';
import { AbstractTooltipProps } from '../interface';

import './ellipsis.scss';

const TOOLTIP_MOUSE_ENTER_DELAY = 400;

interface EllipsisProps extends AbstractTooltipProps {
  title?: React.ReactNode | RenderFunction;
  overlay?: React.ReactNode | RenderFunction;
  className?: string;
}

declare type RenderFunction = () => React.ReactNode;

const Ellipsis = (props: EllipsisProps) => {
  const { title, placement = 'top', className, style, ...restProps } = props;
  const itemRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setTooltip] = useState(false);
  const [enableToolTip, setEnableTooltip] = useState(false);
  const enterDelayTimerRef = useRef<number>();

  const handleMouseEnter = useCallback(() => {
    if (enterDelayTimerRef.current) {
      window.clearTimeout(enterDelayTimerRef.current);
      enterDelayTimerRef.current = undefined;
    }
    enterDelayTimerRef.current = window.setTimeout(() => {
      const { clientWidth = 0, scrollWidth = 0 } = itemRef.current ?? {};
      // 某些场景 ... 的宽度会被折叠，+1 来判断
      if (scrollWidth > clientWidth + 1) {
        setEnableTooltip(true);
        setTooltip(true);
      } else {
        setEnableTooltip(false);
        setTooltip(false);
      }
    }, TOOLTIP_MOUSE_ENTER_DELAY);
  }, [setTooltip]);

  const handleMouseLeave = useCallback(() => {
    if (enterDelayTimerRef.current) {
      window.clearTimeout(enterDelayTimerRef.current);
      enterDelayTimerRef.current = undefined;
    }
    setTooltip(false);
  }, [setTooltip]);

  const EllipsisInner = (
    <div
      className={`erda-ellipsis ${className}`}
      style={style}
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {title}
    </div>
  );

  return (
    <>
      {enableToolTip ? (
        <Tooltip visible={showTooltip} destroyTooltipOnHide title={title} placement={placement} {...restProps}>
          {EllipsisInner}
        </Tooltip>
      ) : (
        EllipsisInner
      )}
    </>
  );
};

export default Ellipsis;
