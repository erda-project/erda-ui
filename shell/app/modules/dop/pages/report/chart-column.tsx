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
import Echarts from 'charts/components/echarts';
import { Report } from 'dop/services';

const ChartColumn = ({ data }: { data: Report[] }) => {
  const [visible, setVisible] = useState(false);

  const option = {
    xAxis: {
      type: 'category',
      data: data.map((item) => moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: data.map((item) => item.budgetMandayTotal),
        type: 'line',
      },
      {
        data: data.map((item) => item.actualMandayTotal),
        type: 'line',
      },
    ],
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
            option={option}
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
