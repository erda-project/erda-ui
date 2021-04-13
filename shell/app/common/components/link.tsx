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
import { Link } from 'react-router-dom';
import { resolvePath } from 'common/utils';
import { Button } from 'app/nusi';

interface IProps {
  children: React.ReactChildren;
  to: {pathname: string, query: object} | string;
  type?: string;
  append?: boolean;
  replace?: boolean;
  exact?: boolean;
  className?: string;
}
export const SimpleLink = ({
  // TODO: exact, 用于进行路由严格匹配
  children, to, append, replace, type = 'a', exact, className, ...otherProps
}: IProps) => {
  if (!to) {
    return <span className={className || ''}>{children}</span>;
  }

  const nowPath = window.location.pathname;
  const props = { replace };
  let pathLength = 0;

  if (typeof to === 'object') {
    pathLength = to.pathname.replace('.', '').length;
    const pathname = nowPath.slice(-pathLength) === to.pathname.replace('.', '')
      ? nowPath
      : append ? resolvePath(to.pathname) : to.pathname;

    return <Link {...otherProps} {...props} to={{ pathname, query: to.query }}>{children}</Link>;
  }

  /**
   * 防止重复点击造成重复拼接 url
   * 这里不能用 includes 匹配判断是否拼接是否重复, 因为面包屑的路由生成时也会被匹配进去
   */
  pathLength = to.replace('.', '').length;
  const link = nowPath.slice(-pathLength) === to.replace('.', '')
    ? nowPath
    : append ? resolvePath(to) : to;

  return type === 'a' ? <Link {...otherProps} {...props} to={link}>{children}</Link> : <Button><Link {...otherProps} {...props} to={link}>{children}</Link></Button>;
};
