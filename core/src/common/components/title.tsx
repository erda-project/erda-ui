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
import { Tooltip } from 'nusi';
import { Help as IconHelp } from '@icon-park/react';
import './title.scss';

interface ITitleProps {
  level?: 1 | 2 | 3;
  operations?: React.ReactNode[];
  title: string;
  showDivider?: boolean;
  tips?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}
export const Title = ({
  level = 1,
  operations = [],
  title = '',
  tips,
  showDivider = level === 1,
  className = '',
  ...restProps
}: ITitleProps) => {
  const sizeList = ['', 'text-lg', 'text-base', 'text-sm'];
  const containerClassList = ['', 'mb-4 h-12', 'h-7 mb-1', 'h-5'];
  return (
    <div
      {...restProps}
      className={`erda-wrapped-title ${containerClassList[level]} ${
        showDivider ? 'border-bottom mb-4' : ''
      } ${className}`}
    >
      <div className="inline-flex items-center font-medium">
        <div className={sizeList[level]}>{title}</div>
        {tips ? (
          <Tooltip title={tips}>
            <IconHelp className="ml-1" />
          </Tooltip>
        ) : null}
      </div>
      <div className="flex-1 flex justify-end">
        {map(operations, (item, index: number) => {
          return (
            <span key={index} className={index > 0 ? 'ml-1' : ''}>
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
};
