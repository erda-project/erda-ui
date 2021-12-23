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
import { getAnalyzerOverview } from 'msp/services/service-list';
import monitorCommonStore from 'common/stores/monitorCommon';
import EChart from 'charts/components/echarts';
import { Spin } from 'antd';
import { groupBy } from 'lodash';
import { genLinearGradient, newColorMap } from 'charts/theme';
import moment from 'moment';
import { getFormatter } from 'charts/utils';

const formatTime = getFormatter('TIME', 'ns');

interface IProps {
  scope: 'topology' | 'serviceOverview';
  view: 'rps_chart' | 'avg_duration_chart' | 'http_code_chart' | 'error_rate_chart';
  tenantId: string;
  serviceId: string;
  style: React.CSSProperties;
  xAxisFormat?: string;
  grid?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
}

const chartConfig = {
  rps_chart: {
    unit: 'reqs/s',
    formatter: (param: Obj[]) => {
      const { data: count, marker, axisValue } = param[0] ?? [];
      return `${axisValue}</br>${marker} ${count} reqs/s`;
    },
  },
  avg_duration_chart: {
    unit: 'ms',
    formatter: (param: Obj[]) => {
      const { data: count, marker, axisValue } = param[0] ?? [];
      return `${axisValue}</br>${marker} ${formatTime.format(count * 1000000)}`;
    },
  },
  error_rate_chart: {
    unit: '%',
    formatter: (param: Obj[]) => {
      const { data: count, marker, axisValue } = param[0] ?? [];
      return `${axisValue}</br>${marker} ${count} %`;
    },
  },
};

const textStyle = {
  color: 'rgba(255, 255, 255, 0.3)',
};

const theme = {
  serviceOverview: {
    yAxis: {},
    xAxis: {},
    legend: {},
    legendTextStyle: {},
  },
  topology: {
    yAxis: {
      splitLine: {
        show: true,
        lineStyle: {
          color: ['rgba(255, 255, 255, 0.1)'],
        },
      },
      axisLabel: {
        textStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
        },
      },
    },
    xAxis: {
      axisLabel: {
        textStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
        },
      },
    },
    legend: {
      pageIconInactiveColor: 'rgba(255, 255, 255, 0.4)',
      pageIconColor: 'rgba(255, 255, 255, 0.8)',
      pageIconSize: 12,
      pageTextStyle: {
        color: 'rgba(255, 255, 255, 0.3)',
      },
      bottom: '1%',
    },
    legendTextStyle: {
      textStyle,
    },
  },
};

const AnalyzerChart: React.FC<IProps> = ({
  view,
  serviceId,
  tenantId,
  style,
  xAxisFormat = 'YYYY-MM-DD HH:mm:ss',
  grid,
  scope,
}) => {
  const range = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan.range);
  const [chartData, setChartData] = React.useState<MSP_SERVICES.SERVICE_LIST_CHART[]>([]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    setLoading(true);
    getAnalyzerOverview
      .fetch({
        tenantId,
        view,
        serviceIds: [serviceId],
        startTime: range.startTimeMs,
        endTime: range.endTimeMs,
      })
      .then((res) => {
        setChartData(res?.data?.list || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tenantId, range, view, serviceId]);
  const currentOption = React.useMemo(() => {
    const { views } = chartData[0] ?? { views: [] };
    const { view: chartView } = views[0] ?? { view: [] };
    const dimensions = groupBy(chartView, 'dimension');
    const dimensionsArr = Object.keys(dimensions);
    const seriesData = [];
    let xAxisData: string[] | number[] = [];
    dimensionsArr.forEach((name) => {
      xAxisData = dimensions[name].map((t) => moment(t.timestamp).format(xAxisFormat));
      let series: Record<string, any> = {
        name,
        data: dimensions[name].map((t) => (view === 'avg_duration_chart' ? t.value / 1000000 : t.value)),
      };
      if (!(view === 'http_code_chart' && name !== '200')) {
        series = {
          ...series,
          itemStyle: {
            normal: {
              lineStyle: {
                color: newColorMap.primary4,
              },
            },
          },
          areaStyle: {
            normal: {
              color: genLinearGradient(newColorMap.primary4),
            },
          },
        };
      }
      seriesData.push(series);
    });
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      yAxis: {
        type: 'value',
        name: chartConfig[view]?.unit,
        nameTextStyle: {
          padding: [0, 7, 0, 0],
          align: 'right',
        },
        ...theme[scope].yAxis,
      },
      tooltip: {
        trigger: 'axis',
        formatter: chartConfig[view]?.formatter,
      },
      xAxis: {
        data: xAxisData,
        nameLocation: 'center',
        splitLine: {
          show: false,
        },
        ...theme[scope].xAxis,
      },
      series: seriesData.map((t) => ({
        ...t,
        type: 'line',
        smooth: false,
      })),
      legend: {
        data: dimensionsArr.map((t) => ({
          name: t,
          ...theme[scope].legendTextStyle,
        })),
        pageIconSize: 12,
        bottom: '1%',
        ...theme[scope].legend,
      },
    };
  }, [chartData, xAxisFormat]);
  return (
    <Spin spinning={loading}>
      <EChart style={style} option={{ ...currentOption, grid }} />
    </Spin>
  );
};

export default AnalyzerChart;
