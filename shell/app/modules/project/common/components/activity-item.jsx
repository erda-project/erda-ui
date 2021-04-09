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
import { ImgHolder } from 'common';
import { fromNow } from 'common/utils';
import './activity-item.scss';
import i18n from 'i18n';

const iconMap = {
  P_CREATE_BRANCH: 'createProject',
  P_PACK_BRANCH: 'packup',
  P_DEPLOY_BRANCH: 'publish',
  P_DELETE_BRANCH: 'shanchu',
  P_OPERATE_MEMBER: 'person',
};

const textMap = {
  P_PACK_BRANCH: i18n.t('project:view packaged logs'),
  P_DEPLOY_BRANCH: i18n.t('project:view deployment log'),
};

const typeMap = {
  P_PACK_BRANCH: 'builds',
  P_DEPLOY_BRANCH: 'deployments',
};

const activityItem = ({
  avatar, operator, action, memo, detailLogId, projectId, runtimeId, actionType, createdAt, onClickLink, singleLine = true,
}) => {
  const link = detailLogId
    ? (
      <span
        className="fake-link"
        onClick={() => onClickLink({
          projectId,
          runtimeId,
          detailLogId,
          logType: typeMap[actionType],
        })}
      >{textMap[actionType]}
      </span>
    )
    : null;
  return (
    <div className="activity-item">
      <div className="activity-item__left">
        <i className={`iconfont icon-${iconMap[actionType]}`} />
        <ImgHolder rect="40x40" src={avatar} text={operator.slice(0, 1)} type="avatar" />
        <div className="activity-item__detail">
          <span className="operator">{operator}</span>
          {singleLine ? <span className="action">{action}</span> : <span className="action">{action}<br /></span>}
          {singleLine ? <span>{memo}{link}</span> : link }
        </div>
      </div>
      <div className="activity-item__right">{fromNow(createdAt)}</div>
    </div>
  );
};
export default activityItem;
