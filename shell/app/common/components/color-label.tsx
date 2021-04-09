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
import classnames from 'classnames';
import { Tag } from 'nusi';
import './color-label.scss';

interface IProps{
  color?: string,
  className?: string,
  style?: object,
  onClick?: () => void,
  onClose?: () => void,
  name?: string,
}

export default ({ color, className, style, onClick, onClose, name }: IProps) => {
  const classes = classnames(
    `bg-label-${color}`,
    className
  );

  return (
    <Tag className={classes} style={style} onClick={onClick} onClose={onClose}><span style={{ marginRight: 3 }}>·</span>{name}</Tag>
  );
};
