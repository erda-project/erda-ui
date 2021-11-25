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
import classNames from 'classnames';
import { get } from 'lodash';
import { ErdaIcon } from 'common';
import './index.scss';

interface IProps {
  type: string;
  className?: string;
  color?: boolean;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
}

const Icon = ({ type, className, style, onClick, color, ...rest }: IProps) => {
  if (React.isValidElement(type)) {
    return type;
  }
  if (type && type.startsWith('ISSUE_ICON')) {
    // 直接返回issue相关icon
    return get(ISSUE_ICON, type.replace('ISSUE_ICON.', '')) || null;
  }
  const classes = classNames(!color && 'iconfont', !color && `icon-${type}`, color && 'icon', className);
  if (color) {
    return (
      <svg className={classes} aria-hidden="true" style={style} onClick={onClick}>
        <use xlinkHref={`#icon-${type}`} />
      </svg>
    );
  }
  return <i aria-label={`icon: ${type}`} className={classes} style={style} onClick={onClick} {...rest} />;
};

// TODO: (zxj)3.21版本该部分icon给后端控制，但因样式过多，先这样快速处理一下，后端只需要给一个type，否则配置属性过多，等后续规范icon
const ISSUE_ICON = {
  iteration: <Icon type="bb1" className="issue-icon iteration" />,
  priority: {
    // 优先级icon
    URGENT: <Icon type="jinji" className="issue-icon priority urgent" />, // 紧急
    HIGH: <Icon type="gao" className="issue-icon priority high" />, // 高
    NORMAL: <Icon type="zhong" className="issue-icon priority normal" />, // 中
    LOW: <Icon type="di" className="issue-icon priority low" />, // 低
  },
  issue: {
    // 事件类型icon
    REQUIREMENT: <Icon type="xiangfatianjia" className="issue-icon issue-type requirement" />,
    TASK: <ErdaIcon type="list-green" className="issue-icon issue-type task mr-1" size="14px" />,
    BUG: <ErdaIcon type="bug" className="issue-icon issue-type bug mr-1" size="14px" color="orange" />,
    EPIC: <Icon type="lichengbei" className="issue-icon issue-type epic" />,
  },
  severity: {
    // 严重程度icon（bug）
    FATAL: <Icon type="P0" className="issue-icon severity fatal" />,
    SERIOUS: <Icon type="P1" className="issue-icon severity serious" />,
    NORMAL: <Icon type="P2" className="issue-icon severity normal" />,
    SLIGHT: <Icon type="P3" className="issue-icon severity slight" />,
    SUGGEST: <Icon type="P4" className="issue-icon severity suggest" />,
  },
  state: {
    // 状态
    OPEN: <Icon type="wh" className="issue-icon state wh" />,
    WORKING: <Icon type="jxz" className="issue-icon state jxz" />,
    TESTING: <Icon type="jxz" className="issue-icon state jxz" />,
    DONE: <Icon type="tg" className="issue-icon state tg" />,
    RESOLVED: <Icon type="tg" className="issue-icon state tg" />,
    REOPEN: <Icon type="zt" className="issue-icon state zt" />,
    WONTFIX: <Icon type="zs" className="issue-icon state zs" />,
    DUP: <Icon type="zs" className="issue-icon state zs" />,
    CLOSED: <Icon type="tg" className="issue-icon state tg" />,
  },
};

export default Icon;
