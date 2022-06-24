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

import { message } from 'antd';
import resolve from 'resolve-pathname';

type ClientType = 'iOS' | 'Android' | 'PC';
/**
 * 判断客户端
 */
export const judgeClient = (): ClientType => {
  const { userAgent } = navigator;
  let client: ClientType;
  // Android机中，userAgent字段中也包含safari，因此要先判断是否是安卓
  if (/(Android)/i.test(userAgent)) {
    client = 'Android';
    // XXX 2020/4/23 IOS 13 之后，在Ipad中，safari默认请求桌面网站，导致userAgent和MAC中safari的userAgent一样
  } else if (/(iPhone|iPad|iPod|iOS)/i.test(userAgent) || (/safari/i.test(userAgent) && 'ontouchend' in document)) {
    client = 'iOS';
  } else {
    client = 'PC';
  }
  return client;
};

export const handleError = (error: { msg: string | undefined } = { msg: undefined }) => {
  console.error(error);
  message.error(error.msg || '很抱歉，当前请求遇到问题，我们将尽快修复！');
};

const globalSpace: any = {};
const getGlobal = (key: string) => globalSpace[key];

interface IGoToOps {
  jumpOut?: boolean;
}
export const goTo = (path: string, ops: IGoToOps = {}) => {
  if (ops.jumpOut) {
    window.open(path);
    return;
  }
  const history = getGlobal('history');
  if (history) {
    history.push(resolve(path, window.location.pathname));
  }
};

interface IObj {
  [key: string]: any;
}
export const byteToM = ({ meta }: IObj) => {
  const { byteSize = 0 } = meta || {};
  return byteSize ? `${(byteSize / 1024 / 1024).toFixed(2)}M` : '';
};
