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
import { getClass } from 'config-page/utils';
import { TextBlockInfo } from 'common';
import './text-block-group.scss';

const TextBlockGroup = (props: CP_TEXT_BLOCK_GROUP.Props) => {
  const { props: configProps, data } = props;

  return (
    <div className={`cp-text-block-group flex flex-col overflow-y-auto p-4 ${getClass(configProps)}`}>
      {data.data.map((rows, rowKey: number) => {
        const isFirstRow = rowKey === 0;
        return (
          <div key={rowKey} className={`cp-text-block-group-row flex items-center ${isFirstRow ? '' : 'mt-4'}`}>
            {rows.map((item, idx: number) => {
              const isFirstItem = idx === 0;
              return <TextBlockInfo key={`${rowKey}-${idx}`} className={isFirstItem ? '' : 'ml-2'} {...item} />;
            })}
          </div>
        );
      })}
    </div>
  );
};

export default TextBlockGroup;
