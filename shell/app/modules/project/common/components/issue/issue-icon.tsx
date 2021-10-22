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
import { Select } from 'antd';
import { map } from 'lodash';
import { ISSUE_OPTION, ISSUE_TYPE_MAP } from 'project/common/components/issue/issue-config';
import i18n from 'i18n';
import './issue-icon.scss';

interface IProps {
  type: 'ITERATION' | 'REQUIREMENT' | 'TASK' | 'BUG' | 'EPIC';
  withName?: boolean;
}

const { Option } = Select;

export const ISSUE_ICON_MAP = {
  EPIC: {
    icon: 'bb1',
    color: 'primary',
    value: 'EPIC',
    name: i18n.t('project:milestone'),
  },
  ITERATION: {
    icon: 'bb1',
    color: 'primary',
    value: 'ITERATION',
    name: i18n.t('project:iteration'),
  },
  REQUIREMENT: {
    icon: ISSUE_TYPE_MAP.REQUIREMENT.icon,
    color: 'palegreen',
    name: i18n.t('requirement'),
    value: 'REQUIREMENT',
  },
  TASK: {
    icon: ISSUE_TYPE_MAP.TASK.icon,
    color: 'darkcyan',
    name: i18n.t('task'),
    value: 'TASK',
  },
  BUG: {
    icon: ISSUE_TYPE_MAP.BUG.icon,
    color: 'red',
    name: i18n.t('bug'),
    value: 'BUG',
  },
};

export const IssueIcon = ({ type, withName = false }: IProps) => {
  const iconObj = ISSUE_TYPE_MAP[type];
  if (!iconObj) return null;
  const { iconLabel, icon } = iconObj || {};
  return withName ? iconLabel : icon;
};

export const getIssueTypeOption = (currentIssueType?: string) =>
  map(ISSUE_OPTION, (item) => {
    const iconObj = ISSUE_TYPE_MAP[item];
    const { value, icon } = iconObj;
    return (
      <Option key={value} value={value} data-icon={icon} disabled={value === currentIssueType}>
        <IssueIcon type={item} withName />
      </Option>
    );
  });
