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
import { Badge as PureBadge, Tooltip } from 'antd';
import { colorMap } from 'config-page/utils';

import './badge.scss';

const Badge = (_props: CP_BADGE.Props) => {
  const { props, data } = _props;
  const list = data?.list;
  return list?.length ? (
    <div>
      {list.map((item) => (
        <Item key={item.text} {...item} />
      ))}
    </div>
  ) : (
    <Item {...props} />
  );
};

const Item = (props: Merge<CP_BADGE.IProps, { className?: string }>) => {
  const { color, withBg, tip, ...rest } = props;
  const pColor = color && (colorMap[color] ?? color);
  const cls = `cp-badge rounded-sm ${withBg ? 'with-bg' : ''}`;
  return (
    <Tooltip title={tip}>
      <PureBadge color={pColor} className={cls} {...rest} />
    </Tooltip>
  );
};

export default Badge;
