// Copyright (c) 2022 Terminus, Inc.
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
import { colorToRgb } from 'common/utils';
import Echarts from 'charts/components/echarts';
import { functionalColor } from 'common/constants';
import { groupBy } from 'lodash';

const themeColor = {
  dark: '#ffffff',
  light: functionalColor.info,
};

const getGridRight = (len: number) => {
  return Math.ceil(len / 2) * 10;
};

const genCommonSize = (min: number, max: number, current: number, interval = 5) => {
  const range = Math.ceil((max - min) / interval);
  for (let i = 1; i <= interval; i++) {
    const criticalValue = min + i * range;
    if (current <= criticalValue) {
      return criticalValue;
    }
  }
  return current;
};

type ISerieData = [number, number, number, string, string];

const CP_BubbleGraph: React.FC<CP_BUBBLE_GRAPH.Props> = (props) => {
  const { props: configProps, data, operations, execOperation, customOp } = props;
  const color = themeColor[configProps.theme ?? 'light'];
  const [option, onEvents] = React.useMemo(() => {
    const dimensions = groupBy(data.list, 'dimension');
    const dimensionsArr = Object.keys(groupBy(data.list, 'dimension'));
    const metaData = {};
    const xAxisData: Array<string | number> = [];
    const sizeArr: Array<number> = [];
    dimensionsArr.forEach((dimension) => {
      const current = dimensions[dimension];
      current.forEach((item) => {
        metaData[dimension] ||= [];
        const xCoords = `${item.x.value}`;
        const yCoords = `${item.y.value}`;
        const size = item.size.value;
        xAxisData.includes(xCoords) || xAxisData.push(xCoords);
        sizeArr.includes(item.size.value) || sizeArr.push(item.size.value);
        metaData[dimension].push([xCoords, yCoords, size, item]);
      });
    });

    const maxSize = Math.max(...sizeArr);
    const minSize = Math.min(...sizeArr);
    const series = Object.keys(metaData).map((dimension) => {
      return {
        name: dimension,
        data: metaData[dimension],
        type: 'scatter',
        symbolSize: (meta: ISerieData) => {
          return configProps.useRealSize ? meta[2] : genCommonSize(minSize, maxSize, meta[2]);
        },
        emphasis: {
          focus: 'series',
          label: {
            show: true,
            formatter: (meta: { data: ISerieData }) => meta.data[2],
            position: 'inside',
          },
        },
      };
    });
    const chartOption = {
      backgroundColor: 'transparent',
      legend: {
        data: (dimensionsArr ?? []).map((item) => ({
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
      grid: {
        containLabel: true,
        left: '5%',
        bottom: 30,
        top: data.subTitle ? 25 : 10,
        right: 0,
      },
      xAxis: {
        data: xAxisData,
        axisLabel: {
          color: colorToRgb(color, 0.6),
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        axisLabel: {
          color: colorToRgb(color, 0.3),
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: [colorToRgb(color, 0.1)],
          },
        },
        scale: true,
      },
      series,
    };
    const chartEvent = {};
    if (customOp?.click || operations?.click) {
      Object.assign(chartEvent, {
        click: (params: { data: Array<string | number> }) => {
          customOp?.click && customOp.click(params.data);
          operations?.click && execOperation(operations.click, params.data);
        },
      });
    }
    return [chartOption, chartEvent];
  }, [data.list, operations, customOp, configProps.useRealSize]);

  return (
    <div className={`px-4 pb-2 ${configProps.className ?? ''}`} style={{ backgroundColor: colorToRgb(color, 0.02) }}>
      <div
        className={`title h-12 flex items-center justify-between ${
          configProps.theme === 'dark' ? 'text-white' : 'text-normal'
        }`}
      >
        {data.title}
      </div>
      <div>
        <Echarts onEvents={onEvents} option={option} style={configProps.style ?? {}} />
      </div>
    </div>
  );
};

export default CP_BubbleGraph;
