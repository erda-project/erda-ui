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
import layoutStore from 'layout/stores/layout';

interface IProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: React.ReactNode;
}

const TopButtonGroup = ({ children, className, ...props }: IProps) => {
  const { updateTopButtonsWidth } = layoutStore.reducers;

  React.useEffect(() => {
    const width = document.getElementsByClassName('top-button-group')[0]?.clientWidth || 0;
    updateTopButtonsWidth(width + 16);
  }, []);

  return (
    <div className={`top-button-group ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

export default TopButtonGroup;
