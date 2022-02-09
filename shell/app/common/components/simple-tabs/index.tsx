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

import * as React from 'react';
import { Tooltip } from 'antd';
import { map } from 'lodash';
import './index.scss';

interface IProps {
  tabs: Array<{ key: string; text: string; disabled?: boolean; tip?: string }>;
  onSelect: (key: string) => void;
  value: string;
  className?: string;
  theme?: 'light' | 'dark';
  mode?: 'underline' | 'button';
}

const SimpleTabs = (props: IProps) => {
  const { tabs, onSelect, value, className = '', theme = 'light', mode = 'button' } = props;
  return (
    <div className={`common-simple-tabs tabs-${mode} flex-h-center ${className} theme-${theme}`}>
      {map(tabs, (item) => {
        return (
          <div
            key={item.key}
            className={`common-simple-tabs-item cursor-pointer ${value === item.key ? 'selected' : ''} ${
              item.disabled ? 'not-allowed' : ''
            }`}
            onClick={() => !item.disabled && onSelect(item.key)}
          >
            <Tooltip title={item.tip}>
              <span>{item.text}</span>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

export default SimpleTabs;
