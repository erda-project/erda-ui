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
import i18n from 'i18n';
import './start-node.scss';

export interface IProps{
  data: Obj;
  onClickNode: (data: any, arg?: any) => void;
  disabled?: boolean;
}

const noop = () => {};

export const StartNode = (props: IProps) => {
  const { onClickNode = noop, data, disabled = false } = props;

  const onClick = () => {
    !disabled && onClickNode(data);
  };


  return (
    <div className='yml-chart-node start-node pointer center-flex-box hover-active' onClick={onClick}>{ disabled ? '' : i18n.t('project:params configuration')}</div>
  );
};
