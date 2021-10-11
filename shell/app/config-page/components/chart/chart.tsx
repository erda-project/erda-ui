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
import { EmptyHolder } from 'common';
import { map, uniq, merge, get } from 'lodash';
import { theme } from 'charts/theme';
import './chart.scss';

const getOption = (chartType: string, option: Obj) => {
  let commonOp: Obj = {
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
      commonOp = {
        ...commonOp,
        xAxis: { splitLine: { show: false } },
      };
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
      commonOp = {
        ...commonOp,
        xAxis: { splitLine: { show: false } },
      };
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
          ...item,
          ...(item.color
            ? {
                color: item.color.map((cItem: string) => colorMap[cItem] || cItem),
              }
            : {}),
        })),
      };
      break;
    default:
      break;
  }
  const isEmpty = !reOption.series?.filter((item: Obj) => item?.data)?.length;

  return {
    option: merge(commonOp, reOption),
    isEmpty,
  };
};

const Chart = (props: CP_CHART.Props) => {
  const { cId, props: configProps, extraContent, operations, execOperation } = props;
  const { style = {}, title, option, chartType, visible = true, ...rest } = configProps || {};
  const { color, ...optionRest } = option || {};
  const presetColor = map(colorMap);
  const reColor = color ? uniq(map(color, (cItem) => colorMap[cItem] || cItem).concat(presetColor)) : presetColor;

  if (!visible) return null;

  const onEvents = {
    click: (params: any) => {
      const dataOp = get(params, 'data.operations.click');
      if (dataOp) {
        execOperation(dataOp, {
          data: params.data,
          seriesIndex: params.seriesIndex,
          dataIndex: params.dataIndex,
        });
      } else if (operations?.click) {
        execOperation(operations.click, {
          data: params.data,
          seriesIndex: params.seriesIndex,
          dataIndex: params.dataIndex,
        });
      }
    },
  };

  const { option: reOption, isEmpty } = getOption(chartType, { color: reColor, ...optionRest });
  return (
    <div className="cp-chart flex flex-col" style={style}>
      {title || extraContent ? (
        <div className="flex items-center justify-between">
          {title ? <div className="mb-2 font-medium">{title}</div> : null}
          <div>{extraContent}</div>
        </div>
      ) : null}
      <div className="cp-chart-container ">
        {isEmpty ? (
          <EmptyHolder />
        ) : (
          <EChart
            key={cId}
            onEvents={onEvents}
            option={reOption}
            notMerge
            theme="monitor"
            themeObj={{ ...theme }}
            {...rest}
          />
        )}
      </div>
    </div>
  );
};

export default Chart;
