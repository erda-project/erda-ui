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
import './title.scss';

interface ITitleProps {
  level?: 1 | 2 | 3;
  operations?: Array<IOperate | React.ReactNode>;
  title: string;
  showDivider?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface IOperate {
  title: React.ReactNode;
}

export const Title = ({
  level = 1,
  operations = [],
  title = '',
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
      </div>
      <div className="flex-1 flex justify-end">
        {map(operations, (item: IOperate | React.ReactNode, index: number) => {
          if (React.isValidElement(item)) {
            return (
              <span key={index} className={index > 0 ? 'ml-1' : ''}>
                {item}
              </span>
            );
          } else {
            return (item as IOperate)?.title ? (
              <span key={index} className={index > 0 ? 'ml-1' : ''}>
                {(item as IOperate).title}
              </span>
            ) : (
              ''
            );
          }
        })}
      </div>
    </div>
  );
};
