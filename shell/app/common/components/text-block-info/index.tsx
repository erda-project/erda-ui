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
import { Tooltip } from 'antd';
import { ErdaIcon } from 'common';

export interface TextBlockInfoProps {
  size?: 'small' | 'normal' | 'big' | 'large';
  align?: 'left' | 'center' | 'right';
  main: string;
  sub?: string;
  desc?: string;
  tip?: string;
  className: string;
  extra?: string | React.ElementType | JSX.Element;
}

const TextBlockInfo = (props: TextBlockInfoProps) => {
  const { className = '', main, size = 'normal', align = 'left', sub, desc, tip, extra } = props;

  const sizeClassMap = {
    small: {
      main: 'text-sm leading-5',
      sub: 'text-xs',
      desc: 'text-xs',
    },
  };

  const sizeClass = sizeClassMap[size];

  return (
    <div className={`flex flex-col ${className}`}>
      <div className={`text-normal font-medium ${sizeClass.main}`}>{main}</div>
      {sub ? <div className={`text-sub ${sizeClass.sub}`}>{sub}</div> : null}
      {desc ? <div className={`text-desc ${sizeClass.desc}`}>{desc}</div> : null}
      {extra ? <div>{extra}</div> : null}
    </div>
  );
};

export default TextBlockInfo;
