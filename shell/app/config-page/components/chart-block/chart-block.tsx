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

const ChartBlock = (props: CP_CHART_BLOCK.Props) => {
  const { filter, children, data: configData, props: configProps } = props;
  const { title } = configData || {};
  const { className = '', childClassName = '', showDefaultBgColor = true, slot } = configProps || {};
  const showHead = title || filter || slot;
  return (
    <div className={`rounded-sm ${className}`}>
      {showHead ? (
        <div className="bg-color-02 h-12 px-4 flex items-center justify-between rounded-t-sm">
          <span className="font-medium">{title}</span>
          <div>
            {filter || null} {slot}
          </div>
        </div>
      ) : null}
      <div className={`p-4 ${childClassName}`}>
        <div className={showDefaultBgColor ? 'bg-color-01' : ''}>{children}</div>
      </div>
    </div>
  );
};

export default ChartBlock;
