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
import EChart from 'charts/components/echarts';
import { colorMap } from 'config-page/utils';
import { map, uniq } from 'lodash';
import { theme } from 'charts/theme';
import './chart.scss';

const Chart = (props: CP_CHART.Props) => {
  const { cId, props: configProps } = props;
  const { style = {}, option, ...rest } = configProps || {};
  const { color, ...optionRest } = option || {};
  const presetColor = map(colorMap);
  const reColor = color ? uniq(map(color, (cItem) => colorMap[cItem] || cItem).concat(presetColor)) : presetColor;

  return (
    <div className="cp-chart" style={style}>
      <EChart
        key={cId}
        option={{ color: reColor, ...optionRest }}
        notMerge
        theme="monitor"
        themeObj={{ ...theme }}
        {...rest}
      />
    </div>
  );
};

export default Chart;
