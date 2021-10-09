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
import { useUpdateEffect } from 'react-use';
import { theme } from 'charts/theme';
import './chart.scss';

const getOption = (chartType: string, option: Obj, data: CP_DATE_PICKER.IData) => {
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
        series: reOption.series.map((item: Obj, idx: number) => {
          const reItem = { ...item };
          if (reItem?.areaStyle?.color?.type === 'linear') {
            const curColor = option.color[((idx + 1) % option.color.length) - 1];
            reItem.areaStyle.color = {
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: curColor },
                { offset: 1, color: '#fff' },
              ],
              ...reItem.areaStyle.color,
            };
          }
          return {
            type: 'line',
            smooth: true,
            ...item,
          };
        }),
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
    case 'treemap':
      reOption = {
        ...reOption,
        series: reOption.series.map((item: Obj) => ({
          type: 'treemap',
          data: data.treemapList,
          ...item,
        })),
      };
      break;
    default:
      break;
  }
  return merge(commonOp, reOption);
};

const Chart = (props: CP_CHART.Props) => {
  const { cId, props: configProps, data: propsData, extraContent, operations, execOperation } = props;
  const { style = {}, title, option, chartType, visible = true, ...rest } = configProps || {};
  const { color, ...optionRest } = option || {};
  const presetColor = map(colorMap);
  const reColor = color ? uniq(map(color, (cItem) => colorMap[cItem] || cItem).concat(presetColor)) : presetColor;

  const [data, setData] = React.useState(propsData);
  useUpdateEffect(() => {
    if (propsData) {
      setData(propsData);
    }
  }, [propsData]);

  if (!visible) return null;

  const onEvents: Obj = {};
  if (operations?.click) {
    onEvents.click = (params: any) => {
      execOperation(operations.click, {
        data: params.data,
        seriesIndex: params.seriesIndex,
        dataIndex: params.dataIndex,
      });
    };
  }
  return (
    <div className="cp-chart flex flex-col" style={style}>
      {title || extraContent ? (
        <div className="flex items-center justify-between">
          {title ? <div className="mb-2 font-medium">{title}</div> : null}
          <div>{extraContent}</div>
        </div>
      ) : null}
      <div className="cp-chart-container ">
        <EChart
          key={cId}
          onEvents={onEvents}
          option={getOption(chartType, { color: reColor, ...optionRest }, data)}
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
