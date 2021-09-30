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
import { map, uniq, merge } from 'lodash';
import { theme } from 'charts/theme';
import './chart.scss';

const getOption = (chartType: string, option: Obj) => {
  const commonOp = {
    grid: {
      bottom: 10,
      containLabel: true,
      right: 20,
      left: 20,
      top: 10,
    },
  };
  let reOption = { ...option };
  switch (chartType) {
    case 'line':
      reOption = {
        tooltip: { trigger: 'axis' },
        yAxis: { type: 'value' },
        ...reOption,
        series: reOption.series.map((item: Obj) => ({
          type: 'line',
          smooth: true,
          ...item,
        })),
      };
      break;
    case 'bar':
      reOption = {
        tooltip: { trigger: 'axis' },
        yAxis: { type: 'value' },
        ...reOption,
        series: reOption.series.map((item: Obj) => ({
          type: 'bar',
          barWidth: '60%',
          ...item,
          label: item.label ? { show: true, ...item.label } : undefined,
        })),
      };
      if (reOption.legend) {
        reOption = merge(
          {
            legend: { bottom: 0 },
            grid: { bottom: 30 },
          },
          reOption,
        );
      }
      break;
    case 'pie':
      reOption = {
        ...reOption,
        series: reOption.series.map((item: Obj) => ({
          type: 'pie',
          ...item,
        })),
      };
      if (reOption.legend) {
        reOption = merge(
          {
            legend: { bottom: 0 },
            grid: { bottom: 40, top: 0 },
          },
          reOption,
        );
      }
      break;
    default:
      break;
  }

  return merge(commonOp, reOption);
};

const Chart = (props: CP_CHART.Props) => {
  const { cId, props: configProps, filter } = props;
  const { style = {}, title, option, chartType, ...rest } = configProps || {};
  const { color, ...optionRest } = option || {};
  const presetColor = map(colorMap);
  const reColor = color ? uniq(map(color, (cItem) => colorMap[cItem] || cItem).concat(presetColor)) : presetColor;

  return (
    <div className="cp-chart" style={style}>
      {title || filter ? (
        <div className="flex items-center justify-between">
          {title ? <div className="mb-2 font-medium">{title}</div> : null}
          {filter}
        </div>
      ) : null}
      <div className="cp-chart-container">
        <EChart
          key={cId}
          option={getOption(chartType, { color: reColor, ...optionRest })}
          notMerge
          theme="monitor"
          themeObj={{ ...theme }}
          {...rest}
        />
      </div>
    </div>
  );
};

export default Chart;
