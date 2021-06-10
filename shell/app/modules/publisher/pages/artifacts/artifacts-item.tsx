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
import { Tooltip, Badge } from 'app/nusi';
import { Icon as CustomIcon } from 'common';
import { fromNow } from 'common/utils';
import { get } from 'lodash';
import { ArtifactsStatusMap } from './config';
import './artifacts-item.scss';

interface IProps {
  data: PUBLISHER.IArtifacts;
  isActive?: boolean;
  onClick?: (o?: any) => any;
}

export const ArtifactsItem = (props: IProps) => {
  const { data, isActive, onClick } = props;
  const { name, updatedAt, public: isPublic } = data;
  const clickItem = () => {
    if (onClick) onClick();
  };
  const status = isPublic ? 'public' : 'unpublic';
  return (
    <div className={`artifacts-item ${isActive ? 'active' : ''}`} onClick={clickItem}>
      <div className="title">
        <CustomIcon type="fb" />
        <Tooltip title={name}>
          <span className="nowrap">{name}</span>
        </Tooltip>
      </div>
      <div className="sub-info">
        <span className="time">{fromNow(updatedAt)}</span>
        <Tooltip title={get(ArtifactsStatusMap, `${status}.name`)}>
          <Badge status={get(ArtifactsStatusMap, `${status}.status`)} />
        </Tooltip>
      </div>
    </div>
  );
};
