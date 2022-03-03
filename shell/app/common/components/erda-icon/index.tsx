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
import themeColor from 'app/theme-color.mjs';
import './index.scss';

type IconColor = keyof typeof themeColor;

export const iconMap = {
  lock: 'lock',
  unlock: 'unlock',
  time: 'time',
  'application-one': 'yingyongkaifa',
  user: 'user',
  'link-cloud-sucess': 'link-cloud-success',
  'link-cloud-faild': 'link-cloud-failed',
  'category-management': 'category-management',
  'list-numbers': 'list-numbers',
  'api-app': 'xiangmuguanli',
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
  xiangmuguanli: 'xiangmuguanli',
  yingyongkaifa: 'yingyongkaifa',
  ceshiguanli: 'ceshiguanli',
  fuwuguance: 'fuwuguance',
  xiangmushezhi: 'xiangmushezhi',
  fuwuliebiao: 'fuwuliebiao',
  fuwujiankong: 'fuwujiankong',
  lianluzhuizong: 'lianluzhuizong',
  rizhifenxi: 'rizhifenxi',
  daimacangku: 'daimacangku',
  liushuixian: 'liushuixian',
  apisheji: 'apisheji',
  bushuzhongxin: 'bushuzhongxin',
  branch: 'daimafenzhi',
  private: 'siyou',
  public: 'gongyou',
  mr: 'mr',
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
    : [
        fill ? themeColor[fill] : 'currentColor',
        color ? themeColor[color] : 'currentColor',
        stroke ? themeColor[stroke] : 'currentColor',
      ];
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

ErdaIcon.themeColor = themeColor;

export default ErdaIcon;
