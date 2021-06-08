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
import { map } from 'lodash';
import moment from 'moment';
import { Spin } from 'app/nusi';
import { Icon as CustomIcon } from 'common';
import { fromNow } from 'common/utils';
import { activityConfig } from 'project/common/config';
import i18n from 'i18n';

import './timeline-activity.scss';

const { iconMap, textMap, typeMap } = activityConfig;

const renderActiveItem = (onClickLink) => ({
  id, actionType, operator, action, memoMap, detailLogId, createdAt, projectId, runtimeId,
}) => (
  <div key={id} className="with-line">
    <div className="operation-item">
      <div className="operation-icon">
        <CustomIcon type={iconMap[actionType]} />
      </div>
      <div className="item-left">
        <div className="operator">{operator}<span className="minor-info">{action}</span> </div>
        {
          map(memoMap, (value, key) => <div key={key} className="memo">{key}: <span className="minor-info">{value}</span></div>)
        }
        {
          detailLogId
            ? (
              <span
                className="fake-link"
                onClick={() => onClickLink({
                  projectId,
                  runtimeId,
                  detailLogId,
                  logType: typeMap[actionType],
                })}
              >
                {textMap[actionType]}
              </span>
            )
            : null
        }
      </div>
      <div>{fromNow(createdAt)}</div>
    </div>
  </div>
);

const TimelineActivity = ({ list: data, onClickLink, isJumping = false }) => {
  const split = [
    [i18n.t('project:nowadays'), 0],
    [i18n.t('project:yesterday'), 1],
    [i18n.t('project:before yesterday'), 7],
    [i18n.t('project:a week ago')],
  ];

  const range = {};

  split.forEach(([key, days], i) => {
    range[key] = {
      start: split[i + 1] === undefined ? moment().set('year', 2000) : moment().subtract(days, 'd').startOf('day'),
      end: split[i - 1] === undefined ? moment() : moment().subtract(split[i - 1][1], 'd').startOf('day'),
      list: [],
    };
  });

  Object.keys(range).forEach((key) => {
    const { start, end, list } = range[key];
    for (let i = 0; i < data.length; i++) {
      if (moment(data[i].createdAt).isBetween(start, end)) {
        list.push(data[i]);
        continue;
      }
    }
  });

  return (
    <Spin tip={`${i18n.t('project:redirecting')}...`} spinning={isJumping}>
      <div className="timeline-activity">
        {
          Object.keys(range).map((key) => {
            const { list } = range[key];
            if (list.length === 0) {
              return null;
            }
            return (
              <div key={key} className="range-block with-line">
                <div className="time-tag">{key}</div>
                {list.map(renderActiveItem(onClickLink))}
              </div>
            );
          })
        }
      </div>
    </Spin>
  );
};
export default TimelineActivity;
