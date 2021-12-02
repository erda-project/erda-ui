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

import React, { SyntheticEvent, useRef, useEffect } from 'react';
import './horizontal-scroll.scss';

interface IProps {
  scroll: number;
  svgWidth: number;
  taskListWidth: number;
  rtl: boolean;
  onScroll: (event: SyntheticEvent<HTMLDivElement>) => void;
}
export const HorizontalScroll = React.forwardRef(
  ({ scroll, svgWidth, taskListWidth, rtl, onScroll }: IProps, scrollRef) => {
    // const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scroll;
      }
    }, [scroll]);

    return (
      <div
        dir="ltr"
        style={{
          margin: rtl ? `0px ${taskListWidth}px 0px 0px` : `0px 0px 0px ${taskListWidth}px`,
        }}
        className={'erda-gantt-horizontal-scroll'}
        onScroll={onScroll}
        ref={scrollRef}
      >
        <div style={{ width: svgWidth, height: 1 }} />
      </div>
    );
  },
);
