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
import { Spin } from 'nusi';
import ActivityItem from './activity-item';
import i18n from 'i18n';

const activityList = ({
  list = [], params, singleLine, ItemComp = ActivityItem, isFetching = false, isJumping = false, onClickLink,
}) => {
  const spinProp = {};
  if (isJumping) {
    spinProp.tip = `${i18n.t('project:redirecting')}...`;
  }
  return (
    <Spin {...spinProp} spinning={isFetching || isJumping}>
      <div className="activity-list">
        {list.map((item, i) => <ItemComp {...item} onClickLink={onClickLink} singleLine={singleLine} params={params} key={i} />)}
      </div>
    </Spin>
  );
};

export default activityList;
