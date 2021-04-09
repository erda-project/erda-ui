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
import moment from 'moment';
import env from './env'; // keep this first of all custom code
import * as lodash from './custom-lodash';
import * as nusi from './nusi';
import * as _master from './master';

import * as commonUtils from 'common/utils';
import * as layoutCommon from 'layout/common';
import * as common from 'common';
import agent from '../agent';
// import * as charts from 'charts';
import * as classnames from 'classnames';


export default () => {
  // 挂载模块到全局对象上
  // 有些组件里用了jsx但没有引React，兼容老代码
  // window.React = React;
  // if (!window._modules) {
  //   window._modules = {};
  // }
  // Object.assign(window._modules, {
  //   moment,
  //   nusi,
  //   lodash, // 专门给其他模块用的lodash
  //   common,
  //   agent,
  //   commonUtils,
  //   layoutCommon,
  //   charts,
  //   classnames,
  // });
  // window._master = _master;
  // // if (process.env.SPLIT_MODULE) {
  // // }
};
export {
  env,
};
