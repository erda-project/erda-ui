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

interface IProps {
  children?: React.ReactNode;
  className?: string;
  breadcrumb?: React.ReactElement;
  navigation: React.ReactElement;
  sidebar?: React.ReactElement;
}

const Shell = ({ children, className, breadcrumb, navigation, sidebar }: IProps) => {
  return (
    <div className={`erda-shell ${className || ''}`}>
      <div className="h-full">{navigation}</div>

      {sidebar}
      {breadcrumb}
      <div className="flex-1 mt-9 mr-4 overflow-hidden">{children}</div>
    </div>
  );
};

export default Shell;
