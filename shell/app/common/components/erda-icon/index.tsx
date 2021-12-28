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
import './index.scss';

// sync with tailwind css
const themeColor = {
  primary: '#6a549e',
  'primary-800': 'rgba(106, 84, 158, 0.8)',
  normal: '#302647cc', // color-dark-8: rgba(48, 38, 71, .8)
  sub: '#30264799', // color-dark-6: rgba(48, 38, 71, .6)
  // desc: '#3026477f', // color-dark-5: rgba(48, 38, 71, .5)
  desc: '#30264766', // color-dark-4: rgba(48, 38, 71, .4)
  icon: '#30264766', // color-dark-3: rgba(48, 38, 71, .3)
  disabled: '#30264766', // color-dark-3: rgba(48, 38, 71, .3)
  holder: '#30264733', // color-dark-3: rgba(48, 38, 71, .2)
  red: '#d84b65',
  danger: '#d84b65',
  error: '#d84b65',
  blue: '#1890ff',
  info: '#1890ff',
  yellow: '#f4b518',
  warning: '#f4b518',
  green: '#27c99a',
  success: '#27c99a',
  orange: '#f47201',
  purple: '#6a549e',
  cyan: '#5bd6d0ff',
  gray: '#666666',
  brightgray: '#eaeaea',
  darkgray: '#999999',
  grey: '#f5f5f5',
  layout: '#f0eef5',
  white: '#ffffff',
  lotion: '#fcfcfc',
  cultured: '#f6f4f9',
  magnolia: '#f2f1fc',
  mask: 'rgba(0,0,0,0.45)',
  black: 'rgba(0,0,0,1)',
  'black-200': 'rgba(0,0,0,0.2)',
  'black-100': 'rgba(0,0,0,0.1)',
  'black-300': 'rgba(0,0,0,0.3)',
  'black-400': 'rgba(0,0,0,0.4)',
  'black-800': 'rgba(0,0,0,0.8)',
  'light-primary': '#6a549e19', // rgba($color-primary, .1)
  'shallow-primary': '#6a549e99', // rgba($color-primary, .6)
  'light-gray': '#bbbbbb',
  'dark-8': '#000000cc',
  'dark-6': '#00000066',
  'dark-2': '#00000033',
  'dark-1': '#00000019',
  'dark-04': '#0000000a',
  'dark-02': '#00000005',
  'white-8': '#ffffffcc',
  'log-font': '#c2c1d0',
  'log-bg': '#3c444f',
  'light-border': 'rgba(222,222,222,0.5)',
  'light-active': '#6a549e0f', // rgba($primary, .06)
  'white-200': 'rgba(255,255,255,0.2)',
  'white-300': 'rgba(255,255,255,0.3)',
  'white-400': 'rgba(255,255,255,0.4)',
  'white-6': 'rgba(255,255,255, 0.6)',
  'white-4': 'rgba(255,255,255, 0.4)',
  'white-1': 'rgba(255,255,255, 0.1)',
  'white-02': 'rgba(255,255,255, 0.02)',
  'white-06': 'rgba(255,255,255, 0.06)',
  'white-800': 'rgba(255,255,255,0.8)',
  'white-9': 'rgba(255,255,255, 0.9)',

  // 标准化后的颜色
  'gray-block-bg': 'rgba(0, 0, 0, 0.02)',
  'hover-gray-bg': 'rgba(0,0,0,0.06)',

  default: '#302647',
  'default-1': 'rgba(48, 38, 71, 0.1)',
  'default-2': 'rgba(48, 38, 71, 0.2)',
  'default-3': 'rgba(48, 38, 71, 0.3)',
  'default-4': 'rgba(48, 38, 71, 0.4)',
  'default-6': 'rgba(48, 38, 71, 0.6)',
  'default-8': 'rgba(48, 38, 71, 0.8)',
  'default-01': 'rgba(48, 38, 71, 0.01)',
  'default-02': 'rgba(48, 38, 71, 0.02)',
  'default-04': ' rgba(48, 38, 71, 0.04)',
  'default-06': 'rgba(48, 38, 71, 0.06)',
  'default-08': 'rgba(48, 38, 71, 0.08)',

  // auxiliary color
  'purple-dark': '#302647',
  'purple-deep': '#A051FF',
  'purple-mid': '#D3ADF7',
  'purple-light': '#F9F0FF',

  'blue-dark': '#003A8C',
  'blue-deep': '#1890FF',
  'blue-mid': '#81D5FF',
  'blue-light': '#E6F7FF',

  'orange-dark': '#871400',
  'orange-deep': '#FA541C',
  'orange-mid': '#FFBB96',
  'orange-light': '#FFF2E8',

  'cyan-dark': '#00474F',
  'cyan-deep': '#13C2C2',
  'cyan-mid': '#87E8DE',
  'cyan-light': '#E6FFFB',

  'green-dark': '#135200',
  'green-deep': '#52C41A',
  'green-mid': '#B7EB8F',
  'green-light': '#F6FFED',

  'magenta-dark': '#780C52',
  'magenta-deep': '#D33E90',
  'magenta-mid': '#FFADD2',
  'magenta-light': '#FFF0F6',

  'yellow-dark': '#613400',
  'yellow-deep': '#FAAD14',
  'yellow-mid': '#FFE58F',
  'yellow-light': '#FFFBE6',

  'red-dark': '#7A2F2F',
  'red-deep': '#E75959',
  'red-mid': '#FFBABA',
  'red-light': '#FFF0F0',

  'water-blue-dark': '#364285',
  'water-blue-deep': '#687FFF',
  'water-blue-mid': '#BDCFFF',
  'water-blue-light': '#F0F2FF',

  'yellow-green-dark': '#666300',
  'yellow-green-deep': '#C9C400',
  'yellow-green-mid': '#ECE97D',
  'yellow-green-light': '#FAF9DC',
  currentColor: 'currentColor',
};

type IconColor = keyof typeof themeColor;

export const iconMap = {
  lock: 'lock',
  unlock: 'unlock',
  time: 'time',
  'application-one': 'application-one',
  user: 'user',
  'link-cloud-sucess': 'link-cloud-success',
  'link-cloud-faild': 'link-cloud-failed',
  'category-management': 'category-management',
  'list-numbers': 'list-numbers',
  'api-app': 'api-app',
  'double-right': 'double-right',
  'application-menu': 'application-menu',
  help: 'help',
  plus: 'tj1',
  moreOne: 'more-one',
  CPU: 'CPU',
  GPU: 'GPU',
  cipan: 'cipan',
  cluster: 'cluster',
  version: 'version',
  machine: 'machine',
  type: 'type',
  management: 'management',
  'create-time': 'create-time',
  renwu: 'renwu',
  xuqiu: 'xuqiu',
  quexian: 'quexian',
  zhongdengnandu: 'zhongdengnandu',
  nan: 'nan',
  rongyi: 'rongyi',
};

interface IErdaIcon {
  className?: string;
  type: string; // unique identification of icon
  style?: React.CSSProperties;
  width?: string; // with of svg, and it's more priority than size
  height?: string; // height of svg, and it's more priority than size
  spin?: boolean; // use infinite rotate animation like loading icon, the default value is false
  size?: string | number; // size of svg with default value of 1rem. Use width and height if width-to-height ratio is not 1
  fill?: string; // color of svg fill area, and it's more priority than color
  stroke?: string; // color of svg stroke, and it's more priority than color
  color?: IconColor; // color of svg
  rtl?: boolean; // acoustic image, the default value is from left to right
  onClick?: React.MouseEventHandler;
  opacity?: number;
  isConfigPageIcon?: boolean;
  disableCurrent?: boolean; // true = use origin color
}

const ErdaIcon = ({
  type,
  fill,
  disableCurrent = false,
  color,
  stroke,
  className,
  isConfigPageIcon,
  ...rest
}: IErdaIcon) => {
  const [fillVal, colorVal, strokeVal] = disableCurrent
    ? []
    : [themeColor[fill || 'currentColor'], themeColor[color || 'currentColor'], themeColor[stroke || 'currentColor']];
  return (
    // @ts-ignore iconpark component
    <iconpark-icon
      name={!isConfigPageIcon ? type : iconMap[type]}
      fill={fillVal}
      color={colorVal}
      stroke={strokeVal}
      class={className}
      {...rest}
    />
  );
};

export default ErdaIcon;
