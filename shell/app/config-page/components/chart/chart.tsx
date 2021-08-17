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
