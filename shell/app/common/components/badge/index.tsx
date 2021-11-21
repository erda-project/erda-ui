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
import { colorToRgb } from 'common/utils';
import './index.scss';

export interface IBadgeProps {
  color?: string;
  tip?: string;
  status?: 'success' | 'error' | 'warning' | 'default' | 'processing';
  text: string;
  size?: 'small' | 'default';
  breathing?: boolean;
  className?: string;
}

const Badge = (props: IBadgeProps) => {
  const { color, tip, status = 'default', text, size = 'default', breathing: pBreathing, className = '' } = props;
  const defaultBreath = { processing: true };
  const breathing = pBreathing === undefined && status ? defaultBreath[status] : pBreathing || false;

  const colorStyle = color ? { color, backgroundColor: colorToRgb(color, 0.1) } : undefined;

  return (
    <Tooltip title={tip}>
      <span
        style={colorStyle}
        className={`erda-badge erda-badge-status-${status} ${
          breathing ? 'badge-breathing' : ''
        } badge-${size} inline-flex items-center rounded-sm ${className}`}
      >
        <span className="erda-badge-status-dot" style={color ? { backgroundColor: color } : {}}>
          <span className="erda-badge-status-breath" />
        </span>
        <span className="erda-badge-status-text">{text}</span>
      </span>
    </Tooltip>
  );
};

export default Badge;
