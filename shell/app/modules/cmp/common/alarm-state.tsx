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
import i18n from 'i18n';

const ALARM_STATE_MAP = {
  alert: { icon: 'wh', label: i18n.t('cmp:alarm') },
  recover: { icon: 'tg', label: i18n.t('cmp:recover') },
};

interface IProps {
  state: string;
}

export const STATE_ICON_COLOR = {
  wh: 'yellow',
  tg: 'green',
};

export const AlarmState = (props: IProps) => {
  const { state } = props;
  const { icon, label } = ALARM_STATE_MAP[state] || {};
  const color = STATE_ICON_COLOR[icon];

  return (
    <span className={'inline-flex justify-between items-center'} style={{ minWidth: '50px' }}>
      <CustomIcon type={icon} className={`rounded-full mr-1 text-white bg-${color}`} />
      <span className={`text-${color}`}>{label}</span>
    </span>
  );
};
