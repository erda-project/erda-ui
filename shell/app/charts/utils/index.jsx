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
import { getFormatter } from './formatter';
import './regist';

import './index.scss';

export { getFormatter } from './formatter';

export const genMarkLine = (markLines, { unitType, decimal }) => {
  if (!markLines.length) {
    return {};
  }
  return {
    silent: true,
    label: {
      normal: {
        show: true,
        position: 'middle',
        formatter: (params) => {
          const y = getFormatter(unitType).format(params.data.yAxis, decimal || 0);
          return `${params.name}: ${y}`;
        },
      },
    },
    data: markLines.map(({ name, value }) => [
      { x: '7%', yAxis: value, name },
      { x: '93%', yAxis: value },
    ]),
  };
};

// export const tooltipFormatter = (ttData) => {
//   const getformat = i => (rightUnitType && i ? rightUnitType : unitType);
//   let tooltip = `${ttData[0].name}<br/>`;
//   ttData.forEach((unit, i) =>
//     tooltip += (`<span style='color: ${unit.color}'>${cutStr(unit.seriesName, 100)} : ${getFormatter(getformat(i)).format(unit.value, 2)}</span><br/>`));
//   return tooltip;
// };
