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

import { Icon as CustomIcon } from 'common';
import React from 'react';
import { ISSUE_STATE_MAP } from 'project/common/components/issue/issue-config';
import { map, isString } from 'lodash';

interface IProps {
  state: string;
  issueButton?: any[];
}

export const STATE_ICON_COLOR = {
  wh: 'yellow',
  zs: 'text',
  jxz: 'blue',
  tg: 'green',
  zt: 'red',
};

export const IssueState = (props: IProps) => {
  const { state } = props;
  const { icon, label } = ISSUE_STATE_MAP[state] || {};
  const color = STATE_ICON_COLOR[icon];

  return (
    <span className={'inline-flex items-center justify-start'} style={{ minWidth: '66px' }}>
      {isString(icon) ? <CustomIcon type={icon} className={`rounded-full mr-1 bg-${color}`} /> : icon}
      <span>{label}</span>
    </span>
  );
};

export const CustomIssueState = (props: IProps) => {
  const { state, issueButton } = props;
  const customStateMap = React.useMemo(() => {
    const temp = {};
    map(issueButton, ({ stateID, stateName, stateBelong }) => {
      temp[stateID] = {
        label: stateName,
        icon: ISSUE_STATE_MAP[stateBelong]?.icon,
      };
    });
    return temp;
  }, [issueButton]);

  const { icon = 'wh', label } = customStateMap[state] || {};
  const color = STATE_ICON_COLOR[icon];

  return (
    <span className={'inline-flex items-center justify-start'} style={{ minWidth: '66px' }}>
      {isString(icon) ? <CustomIcon type={icon} className={`rounded-full text-white mr-1 bg-${color}`} /> : icon}
      <span>{label}</span>
    </span>
  );
};
