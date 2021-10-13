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
import './erda-icon.scss';
import { isNumber } from 'lodash';
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

type IIconType = keyof typeof iconMap;

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

type CustomColor = keyof typeof COLOR;

interface IErdaCustomIcon {
  className?: string;
  type: string; // unique identification of icon
  style?: React.CSSProperties;
  width?: string; // with of svg, and it's more priority than size
  height?: string; // height of svg, and it's more priority than size
  spin?: boolean; // use infinite rotate animation like loading icon, the default value is false
  size?: string; // size of svg with default value of 1rem. Use width and height if width-to-height ratio is not 1
  fill?: CustomColor; // color of svg fill area, and it's more priority than color
  stroke?: CustomColor; // color of svg stroke, and it's more priority than color
  color?: CustomColor; // color of svg
  rtl?: boolean; // acoustic image, the default value is from left to right
  onClick?: React.MouseEventHandler;
  opacity?: number;
}

const COLOR = {
  primary: '106,84,158',
  white: '255,255,255',
  black: '0,0,0',
  'shallow-gray': '187,187,187',
  'danger-red': '223,52,9',
  yellow: '254,171,0',
  gray: '102, 102, 102',
  darkgray: '153, 153, 153',
  lightgray: '187,187,187',
};

const getOpacityColor = (color: string, opacity?: number) => {
  if (isNumber(opacity)) {
    return `rgba(${color},${opacity})`;
  } else {
    return `rgb(${color})`;
  }
};

export const ErdaCustomIcon = ({ type, fill, color, stroke, opacity, className, ...rest }: IErdaCustomIcon) => {
  return (
    // @ts-ignore iconpark component
    <iconpark-icon
      name={type}
      fill={fill ? getOpacityColor(COLOR[fill], opacity) : undefined}
      color={color ? getOpacityColor(COLOR[color], opacity) : undefined}
      stroke={stroke ? getOpacityColor(COLOR[stroke], opacity) : undefined}
      {...rest}
      class={className}
    />
  );
};
