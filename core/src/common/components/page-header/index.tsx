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
import { Breadcrumb, Tooltip } from 'nusi';
import { BreadcrumbProps } from '../../interface';

import './index.scss';

interface IProps {
  breadcrumb?: BreadcrumbProps;
  title?: string | React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader = (props: IProps) => {
  const { breadcrumb, title, children } = props;
  return (
    <div className="erda-header">
      {breadcrumb && (
        <div className="erda-header-breadcrumb">
          <Breadcrumb {...breadcrumb} />
        </div>
      )}

      <div className={`erda-header-header`} style={{ height: '50px' }}>
        <div className={`erda-header-header-left`}>
          <div className="erda-header-title-con">
            {title && (
              <div className={`erda-header-title`}>
                <div className={`erda-header-title-text`}>
                  <Tooltip title={title}>{title}</Tooltip>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {children && <div className={`erda-header-content`}>{children}</div>}
    </div>
  );
};
