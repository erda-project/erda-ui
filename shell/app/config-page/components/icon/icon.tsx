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
import { Lock, Unlock, Time, ApplicationOne, User, LinkCloudSucess, LinkCloudFaild } from '@icon-park/react';

export enum ALL_ICON_KEYS {
  'lock' = 'lock',
  'unlock' = 'unlock',
  'time' = 'time',
  'application-one' = 'application-one',
  'user' = 'user',
  'link-cloud-sucess' = 'link-cloud-sucess',
  'link-cloud-faild' = 'link-cloud-faild',
}

const Icon = (props: CP_ICON.Props) => {
  const { props: configProps } = props;
  const { iconType, ...extraProps } = configProps || {};

  let IconComp: React.FunctionComponent | null = null;
  switch (iconType) {
    case 'lock': {
      IconComp = Lock;
    }
      break;
    case 'unlock': {
      IconComp =  Unlock;
    }
      break;
    case 'time': {
      IconComp =  Time;
    }
      break;
    case 'application-one': {
      IconComp =  ApplicationOne;
    }
      break;
    case 'user': {
      IconComp =  User;
    }
      break;
    case 'link-cloud-sucess': {
      IconComp =  LinkCloudSucess;
    }
      break;
    case 'link-cloud-faild': {
      IconComp =  LinkCloudFaild;
    }
      break;
  }
  return IconComp ? <IconComp {...extraProps} /> : null;
};

export default Icon;
