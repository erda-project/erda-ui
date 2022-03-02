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

const colors = {
  primary: 'rgba(48, 38, 71, 1)', // #302647
  normal: 'rgba(48, 38, 71, .8)',
  sub: 'rgba(48, 38, 71, .6)',
  desc: 'rgba(48, 38, 71, .4)',
  icon: 'rgba(48, 38, 71, .3)',
  disabled: 'rgba(48, 38, 71, .3)',
  holder: 'rgba(48, 38, 71, .2)',

  red: '#d84b65',
  'red-1': 'rgba(216,75,101,0.1)',
  danger: 'rgba(216,75,101,1)',
  error: 'rgba(216,75,101,1)',
  blue: 'rgba(24,144,255,1)',
  'blue-1': 'rgba(24,144,255,0.1)',
  info: 'rgba(24,144,255,1)',
  yellow: 'rgba(244,181,24,1)',
  'yellow-1': 'rgba(244,181,24,0.1)',
  warning: 'rgba(244,181,24,1)',
  green: 'rgba(39,201,154,1)',
  'green-1': 'rgba(39,201,154,0.1)',
  success: 'rgba(39,201,154,1)',
  orange: '#f47201',
  purple: '#6a549e',
  cyan: '#5bd6d0ff',
  gray: '#666666',
  brightgray: '#eaeaea',
  'light-gray': '#bbbbbb',
  darkgray: '#999999',
  grey: '#f5f5f5',
  lotion: '#fcfcfc',
  cultured: '#f6f4f9',
  magnolia: '#f2f1fc',
  mask: 'rgba(0,0,0,0.45)',

  black: 'rgba(0,0,0,1)',
  'black-1': 'rgba(0,0,0,0.1)',
  'black-2': 'rgba(0,0,0,0.2)',
  'black-3': 'rgba(0,0,0,0.3)',
  'black-4': 'rgba(0,0,0,0.4)',
  'black-6': 'rgba(0,0,0,0.6)',
  'black-8': 'rgba(0,0,0,0.8)',
  'black-02': 'rgba(0,0,0,0.02)',
  'black-06': 'rgba(0,0,0,0.06)',
  white: 'rgba(255,255,255)',
  'white-1': 'rgba(255,255,255,0.1)',
  'white-2': 'rgba(255,255,255,0.2)',
  'white-3': 'rgba(255,255,255,0.3)',
  'white-4': 'rgba(255,255,255,0.4)',
  'white-6': 'rgba(255,255,255,0.6)',
  'white-8': 'rgba(255,255,255,0.8)',
  'white-9': 'rgba(255,255,255,0.9)',
  'white-02': 'rgba(255,255,255, 0.02)',
  'white-04': 'rgba(255,255,255, 0.04)',
  'white-06': 'rgba(255,255,255, 0.06)',
  'white-08': 'rgba(255,255,255, 0.08)',

  'light-pop-bg': '#59516c',
  'log-font': '#c2c1d0',
  'log-bg': '#3c444f',
  'light-border': 'rgba(222,222,222,0.5)', // 标准化后的颜色
  'table-head-bg': '#fbfbfb',

  default: '#302647',
  'default-1': 'rgba(48, 38, 71, 0.1)',
  'default-2': 'rgba(48, 38, 71, 0.2)',
  'default-3': 'rgba(48, 38, 71, 0.3)',
  'default-4': 'rgba(48, 38, 71, 0.4)',
  'default-6': 'rgba(48, 38, 71, 0.6)',
  'default-8': 'rgba(48, 38, 71, 0.8)',
  'default-01': 'rgba(48, 38, 71, 0.01)',
  'default-02': 'rgba(48, 38, 71, 0.02)',
  'default-04': 'rgba(48, 38, 71, 0.04)',
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
};

const themeColor = colors.primary;

export const getLessTheme = () => {
  return {
    '@primary-color': themeColor,
    '@success-color': '#27c99a',
    '@error-color': '#d84b65',
    '@warning-color': '#f4b518',
    '@link-color': themeColor,
    '@progress-remaining-color': '#E1E7FF',
    '@font-size-base': '14px',
    '@height-base': '32px',
    '@height-lg': '36px',
    '@height-sm': '28px',
    '@border-radius-base': '2px;',
    '@font-family': '"Roboto-Regular", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
  };
};


export default colors;
