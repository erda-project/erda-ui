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
import themeColors from 'app/theme-color.mjs';
import { colorToRgb } from 'common/utils';
import Echarts from 'charts/components/echarts';
import EmptyHolder from 'common/components/empty-holder';
import { formatValue } from 'charts/utils';

const themeColor = {
  dark: themeColors.white,
  light: themeColors.default,
};

const genAxis = (axis: CP_COMPLEX_GRAPH.Axis[], axisType: 'x' | 'y', color: string) => {
  const positionMap = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };
  return axis.map((item) => {
    const { structure, ...rest } = item;
    const { enable, type, precision } = structure;
    const offset = positionMap[rest.position];
    positionMap[rest.position] = offset + 1;
    let min: number | undefined;
    let max: number | undefined;
    if (type === 'timestamp') {
      min = rest.data[0] as number;
      max = rest.data[rest.data.length - 1] as number;
    }
    return {
      offset: offset * 50,
      axisLabel: {
        color: colorToRgb(color, 0.3),
        formatter: enable ? (v: number) => formatValue(type, precision, v, min, max) : undefined,
      },
      splitLine: {
        show: axisType === 'y',
        lineStyle: {
          color: [colorToRgb(color, 0.1)],
        },
      },
      ...rest,
    };
  });
};

const CP_ComplexGraph: React.FC<CP_COMPLEX_GRAPH.Props> = (props) => {
  const { props: configProps, data, operations } = props;
  const color = themeColor[configProps.theme ?? 'light'];

  const [option] = React.useMemo(() => {
    const { xAxis, yAxis, series, inverse, dimensions } = data;
    const [X_Axis, Y_Axis] = inverse ? [yAxis, xAxis] : [xAxis, yAxis];
    const axisIndex = inverse ? 'xAxisIndex' : 'yAxisIndex';
    const chartOption = {
      backgroundColor: 'transparent',
      grid: {
        containLabel: true,
        left: 30,
        bottom: 30,
        top: 10,
        right: 0,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (param: any[]) => {
          const { structure: xStructure } = xAxis[0];
          const { axisValue } = param[0] || [];
          const tips = [`${formatValue(xStructure.type, xStructure.precision, axisValue)}`];
          param.forEach((item) => {
            const { structure } = yAxis.find((t) => t.dimensions?.includes(item.seriesName)) ?? yAxis[0];
            tips.push(
              `${item.marker} ${item.seriesName}: ${formatValue(structure.type, structure.precision, item.data)}`,
            );
          });
          return tips.join('</br>');
        },
      },
      legend: {
        data: (dimensions || []).map((item) => ({
          name: item,
          textStyle: {
            color: colorToRgb(color, 0.6),
          },
        })),
        icon: 'reat',
        itemWidth: 12,
        itemHeight: 3,
        type: 'scroll',
        bottom: true,
      },
      series: (series || []).map((item) => {
        return {
          ...item,
          name: item.name || item.dimension,
          type: item.type,
          [axisIndex]: yAxis.findIndex((t) => t.dimensions.includes(item.dimension)),
        };
      }),
      yAxis: genAxis(Y_Axis, 'y', color),
      xAxis: genAxis(X_Axis, 'x', color),
    };
    return [chartOption];
  }, [color, data, operations]);

  return (
    <div className={`px-4 pb-2 ${configProps.className ?? ''}`} style={{ backgroundColor: colorToRgb(color, 0.02) }}>
      {data.title ? (
        <div
          className={`title h-12 flex items-center justify-between ${
            configProps.theme === 'dark' ? 'text-white' : 'text-normal'
          }`}
        >
          {data.title}
        </div>
      ) : null}
      <div className={data.title ? '' : 'pt-4'}>
        {option.series.length && option.yAxis.length ? (
          <Echarts
            key={Date.now()}
            option={option}
            style={{
              width: '100%',
              height: '170px',
              minHeight: 0,
              ...configProps.style,
            }}
          />
        ) : (
          <EmptyHolder relative />
        )}
      </div>
    </div>
  );
};

export default CP_ComplexGraph;
