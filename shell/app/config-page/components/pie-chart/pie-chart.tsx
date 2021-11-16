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
import { colorMap, getClass, getFormatterString } from 'config-page/utils';
import { EmptyHolder, TextBlockInfo } from 'common';
import { map, uniq, merge, get, sumBy } from 'lodash';

import './pie-chart.scss';

const getOption = (data: CP_PIE_CHART.IData[] = [], _option: Obj, configProps: Obj) => {
  const color = map(data, 'color');
  const option = {
    ...(configProps.grayBg ? { backgroundColor: '' } : {}),
    series: [
      {
        type: 'pie',
        color: color.length ? color : undefined,
        radius: ['75%', '100%'],
        label: { show: false },
        emphasis: { scale: false },
        hoverAnimation: false,
        data: data?.map(({ name, value }) => {
          return { name, value };
        }),
      },
    ],
  };
  const isEmpty = !data?.length;

  return {
    option: merge({ ..._option }, option),
    isEmpty,
  };
};

const Chart = (props: CP_PIE_CHART.Props) => {
  const { cId, props: configProps, extraContent, operations, execOperation, data } = props;
  const {
    style = {},
    size = 'normal',
    direction = 'row',
    pureChart,
    title,
    tip,
    option,
    visible = true,
    ...rest
  } = configProps || {};
  const presetColor = map(colorMap);

  if (!visible) return null;

  const styleMap = {
    small: {
      chartStyle: { width: 56, height: 56 },
      infoCls: { col: 'mt-3', row: 'ml-3' },
    },
    normal: {},
    big: {},
    large: {},
  };

  const styleObj = styleMap[size];
  const onEvents = {
    click: (params: any) => {
      const dataOp = get(params, 'data.operations.click') || operations?.click;
      if (dataOp) {
        execOperation(dataOp, {
          data: params.data,
          seriesIndex: params.seriesIndex,
          dataIndex: params.dataIndex,
        });
      }
    },
  };
  const color = map(data?.data, 'color');
  const reColor = color ? uniq(map(color, (cItem) => colorMap[cItem] || cItem).concat(presetColor)) : presetColor;

  const { option: reOption, isEmpty } = getOption(data?.data, option, configProps);
  const finalColor = reOption.color || reColor;
  const ChartComp = (
    <EChart
      key={cId}
      onEvents={onEvents}
      option={{ color: reColor, ...reOption }}
      notMerge
      style={styleObj?.chartStyle}
      {...rest}
    />
  );

  const total = sumBy(data?.data, 'value');

  const Comp = (
    <div className="flex items-center">
      {ChartComp}
      <div className={`flex-1 flex justify-between ${styleObj?.infoCls?.[direction]}`} style={{ minWidth: 100 }}>
        {data?.data?.map((item: CP_PIE_CHART.IData, idx: number) => {
          return (
            <TextBlockInfo
              size="small"
              key={item.name}
              main={`${item.formatter ? getFormatterString(item.formatter, { v: item.value }) : item.value}`}
              sub={total ? (item.value / total).toFixed(1) : '-'}
              extra={
                <div className="flex items-center">
                  <span className="rounded" style={{ width: 4, height: 10, backgroundColor: finalColor[idx] }} />
                  <span className="ml-1 text-desc text-xs">{item.value}</span>
                </div>
              }
            />
          );
        })}
      </div>
    </div>
  );

  return <div className={`cp-pie-chart p-3 ${getClass(configProps)}`}>{isEmpty ? <EmptyHolder relative /> : Comp}</div>;
};

export default Chart;
