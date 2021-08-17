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

import * as React from 'react';
import { MonitorChartNew, PieChart, MapChart, HollowPieChart } from 'charts';
import './chart.scss';

const Chart = (props: CP_CHART.Props) => {
  const { props: configProps, data } = props;
  const { chartType, title, style = {}, ...rest } = configProps || {};
  const boxRef = React.useRef<HTMLDivElement>(null);
  const [chartStyle, setChartStyle] = React.useState({});

  let ChartComp: any;
  switch (chartType) {
    case 'pie':
      ChartComp = PieChart;
      break;
    case 'map':
      ChartComp = MapChart;
      break;
    case 'hollow-pie':
      ChartComp = HollowPieChart;
      break;
    default:
      ChartComp = MonitorChartNew;
  }

  return (
    <div className="cp-chart" style={style} ref={boxRef}>
      <ChartComp {...rest} style={style.height ? { height: style.height } : {}} data={{ ...data }} />
    </div>
  );
};

export default Chart;
