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
import { 
  Lock,
  Unlock,
  Time, 
  ApplicationOne, 
  User, 
  LinkCloudSucess, 
  LinkCloudFaild, 
  ListNumbers, 
  CategoryManagement, 
  ApiApp 
} from '@icon-park/react';

export const iconMap = {
  'lock': Lock,
  'unlock': Unlock,
  'time': Time,
  'application-one': ApplicationOne,
  'user': User,
  'link-cloud-sucess': LinkCloudSucess,
  'link-cloud-faild': LinkCloudFaild,
  'category-management': CategoryManagement,
  'list-numbers': ListNumbers,
  'api-app': ApiApp,
}

const Icon = (props: CP_ICON.Props) => {
  const { props: configProps } = props;
  const { iconType, ...extraProps } = configProps || {};

  const IconComp = iconMap[iconType];

  return IconComp ? <IconComp {...extraProps} /> : <span>Not Exists</span>;
};

export default Icon;
