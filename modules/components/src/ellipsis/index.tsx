import React, { useState, useRef, useCallback } from 'react';
import { Tooltip } from 'antd';
import { AbstractTooltipProps } from 'antd/es/tooltip';
import cn from 'classnames';
import { usePrefixCls } from '../_util/hooks';

const TOOLTIP_MOUSE_ENTER_DELAY = 100;

export interface EllipsisProps extends AbstractTooltipProps {
  title?: React.ReactNode | RenderFunction;
}

declare type RenderFunction = () => React.ReactNode;

const Ellipsis = (props: EllipsisProps) => {
  const { title, placement = 'top', className, style, ...restProps } = props;
  const itemRef = useRef<HTMLDivElement>(null);
  const [enableToolTip, setEnableTooltip] = useState(false);
  const enterDelayTimerRef = useRef<number>();
  const [width, setWidth] = React.useState(0);

  const [prefixCls] = usePrefixCls('ellipsis');

  const handleMouseEnter = useCallback(() => {
    if (enterDelayTimerRef.current) {
      window.clearTimeout(enterDelayTimerRef.current);
      enterDelayTimerRef.current = undefined;
    }
    enterDelayTimerRef.current = window.setTimeout(() => {
      const { clientWidth = 0, scrollWidth = 0, offsetWidth = 0 } = itemRef.current ?? {};
      if (offsetWidth !== width) {
        setWidth(offsetWidth);
        // 某些场景 ... 的宽度会被折叠，+1 来判断
        if (scrollWidth > clientWidth + 1) {
          setEnableTooltip(true);
        } else {
          setEnableTooltip(false);
        }
      }
    }, TOOLTIP_MOUSE_ENTER_DELAY);
  }, [width]);

  const EllipsisInner = (
    <div className={cn(className, prefixCls)} style={style} ref={itemRef} onMouseEnter={handleMouseEnter}>
      {title}
    </div>
  );

  return (
    <Tooltip
      destroyTooltipOnHide
      title={enableToolTip ? title : ''}
      placement={placement}
      {...restProps}
      mouseEnterDelay={0.2}
    >
      {EllipsisInner}
    </Tooltip>
  );
};

export default Ellipsis;
