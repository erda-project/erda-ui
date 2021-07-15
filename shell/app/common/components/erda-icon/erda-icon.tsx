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
import './erda-icon.scss';
import {
  Lock as IconLock,
  Unlock as IconUnlock,
  Time as IconTime,
  ApplicationOne as IconApplicationOne,
  User as IconUser,
  LinkCloudSucess as IconLinkCloudSucess,
  LinkCloudFaild as IconLinkCloudFaild,
  ListNumbers as IconListNumbers,
  CategoryManagement as IconCategoryManagement,
  ApiApp as IconApiApp,
  DoubleRight as IconDoubleRight,
  ApplicationMenu as IconApplicationMenu,
} from '@icon-park/react';

export const iconMap = {
  lock: IconLock,
  unlock: IconUnlock,
  time: IconTime,
  'application-one': IconApplicationOne,
  user: IconUser,
  'link-cloud-sucess': IconLinkCloudSucess,
  'link-cloud-faild': IconLinkCloudFaild,
  'category-management': IconCategoryManagement,
  'list-numbers': IconListNumbers,
  'api-app': IconApiApp,
  'double-right': IconDoubleRight,
  'application-menu': IconApplicationMenu,
};

type IIconType =
  | 'lock'
  | 'unlock'
  | 'time'
  | 'application-one'
  | 'user'
  | 'link-cloud-sucess'
  | 'link-cloud-faild'
  | 'category-management'
  | 'list-numbers'
  | 'api-app'
  | 'double-right'
  | 'application-menu';

type StrokeLinejoin = 'miter' | 'round' | 'bevel';
type StrokeLinecap = 'butt' | 'round' | 'square';
type Theme = 'outline' | 'filled' | 'two-tone' | 'multi-color';

interface IProps {
  className?: string;
  style?: React.CSSProperties;
  iconType: IIconType;
  size?: number | string;
  strokeWidth?: number;
  strokeLinecap?: StrokeLinecap;
  strokeLinejoin?: StrokeLinejoin;
  theme?: Theme;
  fill?: string | string[];
  onClick?: React.MouseEventHandler;
}

export const ErdaIcon = ({ className = '', onClick, iconType, ...rest }: IProps) => {
  const IconComp = iconMap[iconType];

  return IconComp ? <IconComp className={className} onClick={onClick} {...rest} /> : <span>Not Exists</span>;
};
