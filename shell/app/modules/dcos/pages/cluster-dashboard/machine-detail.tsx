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

import { getFormatter } from 'charts/utils/formatter';
import { Holder, BoardGrid } from 'common';
import i18n from 'i18n';
import { isEmpty, isFunction, map } from 'lodash';
import { Tag } from 'antd';
import React from 'react';
import TimeRangeSelector from 'common/components/monitor/components/timeRangeSelector';
import { useMount } from 'react-use';
import CommonDashboardStore from 'common/stores/dashboard';
import { firstCharToUpper } from 'app/common/utils';

import './machine-detail.scss';

const DashBoard = React.memo(BoardGrid.Pure);

const itemConfigs = [
  {
    title: i18n.t('Host name'),
    value: 'hostname',
  },
  {
    title: firstCharToUpper(i18n.t('cluster')),
    value: 'clusterName',
  },
  {
    title: i18n.t('Label'),
    render: ({ labels }: any) => map((labels || '').split(','), (label) => <Tag key={label}>{label}</Tag>),
  },
  {
    title: 'CPU',
    value: 'cpuTotal',
    render: (cpus: number) => `${cpus} ${i18n.t('core')}`,
  },
  {
    title: i18n.t('memory'),
    value: 'memTotal',
    render: (memory: number) => `${getFormatter('STORAGE').format(memory)}`,
  },
  {
    title: i18n.t('Disk'),
    value: 'diskTotal',
    render: (disk: number) => `${getFormatter('STORAGE').format(disk)}`,
  },
  {
    title: i18n.t('System version'),
    render: ({ os, kernelVersion }: any) => `${os} ${kernelVersion}`,
  },
];

export interface IProps {
  type: string;
  machineDetail: ORG_MACHINE.IMachine;
}

const MachineDetail = ({ type, machineDetail }: IProps) => {
  let Content = null;
  if (machineDetail) {
    switch (type) {
      case 'info':
        Content = map(itemConfigs, ({ title, value, render }) => (
          <div className="machine-detail-info-item mb-7" key={title}>
            <div className="label mb-2">{title}</div>
            <div className="value">
              {isFunction(render)
                ? render(value ? machineDetail[value] : machineDetail)
                : value
                ? machineDetail[value]
                : null}
            </div>
          </div>
        ));
        break;
      case 'insight':
        Content = <MachineOverviewDashboard machineDetail={machineDetail} />;

        break;
      default:
        break;
    }
  }

  return <Holder when={isEmpty(machineDetail)}>{Content}</Holder>;
};

const MachineOverviewDashboard = ({ machineDetail }: { machineDetail: ORG_MACHINE.IMachine }) => {
  const [timeSpan, setTimeSpan] = React.useState({
    startTimeMs: Date.now() - 3600 * 1000,
    endTimeMs: Date.now(),
  });

  const [chartLayout, setChartLayout] = React.useState<DC.Layout>([]);

  useMount(() => {
    CommonDashboardStore.getCustomDashboard({
      id: 'runtime-container-detail',
      isSystem: true,
    }).then((res) => setChartLayout(res));
  });

  const globalVariable = React.useMemo(
    () => ({
      startTime: timeSpan.startTimeMs,
      endTime: timeSpan.endTimeMs,
      clusterName: machineDetail.clusterName,
      hostIP: machineDetail.ip,
    }),
    [timeSpan, machineDetail],
  );

  return (
    <div>
      <TimeRangeSelector
        timeSpan={timeSpan}
        onChangeTime={([start, end]) => setTimeSpan({ startTimeMs: start.valueOf(), endTimeMs: end.valueOf() })}
      />
      <Holder when={isEmpty(chartLayout)}>
        <DashBoard layout={chartLayout} globalVariable={globalVariable} />
      </Holder>
    </div>
  );
};

export default MachineDetail;
