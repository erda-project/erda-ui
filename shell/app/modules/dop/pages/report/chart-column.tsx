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

import React, { useState } from 'react';
import { Modal } from 'antd';
import moment from 'moment';
import i18n from 'i18n';
import Echarts from 'charts/components/echarts';
import { Report } from 'dop/services';

const ChartColumn = ({ data }: { data: Report[] }) => {
  const [visible, setVisible] = useState(false);

  const lastItem = data[data.length - 1];

  const option = {
    xAxis: {
      type: 'category',
      data: data.map((item) => moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')),
    },
    yAxis: {
      type: 'value',
    },
    grid: {
      bottom: 20,
      right: 10,
      top: 50,
    },
    series: [
      {
        name: i18n.t('dop:work hours'),
        data: data.map((item) => Number(item.budgetMandayTotal.toFixed(2))),
        type: 'line',
      },
      {
        name: i18n.t('dop:actual manday total'),
        data: data.map((item) => Number(item.actualMandayTotal.toFixed(2))),
        type: 'line',
      },
      {
        name: i18n.t('dop:task estimated manday'),
        data: data.map((item) => Number(item.taskEstimatedManday.toFixed(2))),
        type: 'line',
        lineStyle: {
          type: 'dashed',
        },
      },
      ...(lastItem && lastItem.budgetMandayTotal && lastItem.beginDate && (lastItem.actualEndDate || lastItem.endDate)
        ? [
            {
              name: i18n.t('dop:emp estimated manday'),
              data: () => {
                let data = [];
                const start = Number(lastItem.beginDate);
                const end = Number(lastItem.actualEndDate || lastItem.endDate);
                const value = lastItem.budgetMandayTotal;

                for (let i = -200; i <= 200; i += 0.1) {
                  data.push([i, value / (start - end)]);
                }
                return data;
              },
              type: 'line',
              lineStyle: {
                type: 'dashed',
              },
            },
          ]
        : []),
    ],
  };

  const otherOption = {
    yAxis: {
      type: 'value',
      name: i18n.t('dop:man day'),
    },
    legend: {
      data: [
        i18n.t('dop:work hours'),
        i18n.t('dop:actual manday total'),
        i18n.t('dop:task estimated manday'),
        i18n.t('dop:emp estimated manday'),
      ],
      right: 10,
    },
    tooltip: {
      show: true,
    },
  };
  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setVisible(true);
        }}
        className="origin-top-left scale-50 w-[180px] h-[80px]"
      >
        <Echarts
          option={option}
          style={{
            width: '360px',
            height: '160px',
            minHeight: 0,
          }}
        />
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <Modal width="800px" visible={visible} onCancel={() => setVisible(false)} footer={false}>
          <Echarts
            option={{ ...option, ...otherOption }}
            style={{
              width: '720px',
              height: '320px',
              minHeight: 0,
            }}
          />
        </Modal>
      </div>
    </>
  );
};

export default ChartColumn;
