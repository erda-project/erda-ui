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
import { Tooltip } from 'nusi';
import { TooltipPlacement } from '../interface';

import './ellipsis.scss';

interface IProps {
  title: string | number | React.ReactNode;
  placement?: TooltipPlacement;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Ellipsis = (props: IProps) => {
  const { title, placement, className, style, children, ...rest } = props;
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [showTip, setShowTip] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (contentRef.current && contentRef.current?.scrollWidth > contentRef.current?.offsetWidth) {
      setShowTip(true);
    }
  }, [title, setShowTip]);

  return (
    <>
      {showTip ? (
        <Tooltip
          title={title}
          placement={placement}
          className={className}
          style={style}
          overlayClassName={'erda-ellipsis'}
          {...rest}
        >
          <div className="erda-ellipsis-truncate" ref={contentRef}>
            {children || title}
          </div>
        </Tooltip>
      ) : (
        <div className="erda-ellipsis-truncate" ref={contentRef}>
          {children || title}
        </div>
      )}
    </>
  );
};
