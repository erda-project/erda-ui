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
import { shuffle } from 'lodash';
import { ErdaIcon } from 'common';
import { colorToRgb } from 'common/utils';
import classnames from 'classnames';
import './index.scss';

export interface IBadgeProps {
  color?: string;
  tip?: string;
  status?: 'success' | 'error' | 'warning' | 'default' | 'processing';
  text: string;
  size?: 'small' | 'default';
  breathing?: boolean;
  className?: string;
  showDot?: boolean;
  onlyDot?: boolean;
  onlyText?: boolean;
  suffixIcon?: string;
  onClick?: () => void;
}

enum BadgeStatus {
  success = 'success',
  error = 'error',
  warning = 'warning',
  default = 'default',
  processing = 'processing',
}

const Badge = (props: IBadgeProps) => {
  const {
    color,
    tip,
    status: pStatus,
    text,
    size = 'default',
    breathing: pBreathing,
    className = '',
    showDot = true,
    onlyDot,
    suffixIcon,
    onlyText,
    onClick,
  } = props;
  const status = pStatus || 'default';
  const defaultBreath = { processing: true };
  const breathing = pBreathing === undefined && status ? defaultBreath[status] : pBreathing || false;

  const colorStyle = color ? { color, backgroundColor: colorToRgb(color, 0.1) } : undefined;

  const breathCls = breathing ? `badge-breathing badge-breathing-${shuffle([1, 2, 3])[0]}` : '';
  const hasClickOp = !!onClick;

  const cls = classnames(
    {
      'erda-badge': true,
      [`erda-badge-status-${status}`]: true,
      'erda-badge-hide-bg': onlyText,
      [`badge-${size}`]: true,
      'inline-flex': true,
      'items-center': true,
      'rounded-sm': true,
      'only-dot': onlyDot,
      'badge-hover-active': hasClickOp,
    },
    className,
    breathCls,
  );

  return (
    <Tooltip title={tip}>
      <span style={onlyDot ? {} : colorStyle} className={`${cls}`} onClick={onClick}>
        {onlyDot || showDot ? (
          <span className="erda-badge-status-dot" style={color ? { backgroundColor: color } : {}}>
            <span className="erda-badge-status-breath" />
          </span>
        ) : null}
        {!onlyDot || onlyText ? (
          <span className="erda-badge-status-text flex-h-center">
            {text} {suffixIcon ? <ErdaIcon type={suffixIcon} /> : null}
          </span>
        ) : null}
      </span>
    </Tooltip>
  );
};

Badge.BadgeStatus = BadgeStatus;

export default Badge;
