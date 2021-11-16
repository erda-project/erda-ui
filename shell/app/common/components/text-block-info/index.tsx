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
import { ErdaIcon } from 'common';
import { Tooltip } from 'antd';
import './index.scss';

export interface TextBlockInfoProps {
  size?: 'small' | 'normal';
  main: string;
  sub?: string;
  desc?: string;
  tip?: string;
  className: string;
  extra?: string | React.ElementType | JSX.Element;
}

const TextBlockInfo = (props: TextBlockInfoProps) => {
  const { className = '', main, size = 'normal', sub, desc, tip, extra } = props;

  return (
    <div className={`erda-text-block-info ${size} flex flex-col ${className}`}>
      <div className={'main-text'}>{main}</div>
      {sub ? <div className={'sub-text'}>{sub}</div> : null}
      {desc ? (
        <div className={'desc-text flex items-center'}>
          {desc}
          {tip ? (
            <Tooltip title={tip}>
              <ErdaIcon type="help" className="ml-1" />
            </Tooltip>
          ) : null}
        </div>
      ) : null}
      {extra ? <div>{extra}</div> : null}
    </div>
  );
};

export default TextBlockInfo;
