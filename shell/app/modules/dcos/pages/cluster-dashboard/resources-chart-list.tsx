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

import React, { useEffect } from 'react';
import i18n from 'i18n';
import { find, compact, isEmpty, reduce, map, filter } from 'lodash';
import classNames from 'classnames';
import { Row, Col, Spin } from 'app/nusi';
import { Holder, TimeSelector, useUpdate } from 'common';
import { MonitorChartNew } from 'charts';
import { ChartContainer } from 'charts/utils';
import clusterDashboardStore from '../../stores/dashboard';
import { useLoading } from 'app/common/stores/loading';
import monitorCommonStore from 'common/stores/monitorCommon';
import machineStore from 'dcos/stores/machine';
import orgStore from 'app/org-home/stores/org';

import './resources-chart-list.scss';

interface IProps {
  clusters: any[];
  machineList: ORG_MACHINE.IMachine[];
  setActiveKey(key: string): void;
  getMachineStatus(hosts: string[]): Promise<any[]>;
}

const ResourcesChartList = ({
  clusters,
  machineList,
  setActiveKey,
}: IProps) => {
  const [chartList, serviceList, jobList] = clusterDashboardStore.useStore(s => [s.chartList, s.serviceList, s.jobList]);
  const { getChartData, getInstanceList } = clusterDashboardStore.effects;
  const [loading] = useLoading(clusterDashboardStore, ['getChartData']);
  const { getMachineStatus } = machineStore.effects;
  const timeSpan = monitorCommonStore.useStore(s => s.timeSpan);
  const orgName = orgStore.useStore(s => s.currentOrg.name);

  const getChartList = React.useCallback((extra: object) => {
    getChartData({ type: 'cpu', ...extra });
    getChartData({ type: 'mem', ...extra });
    getChartData({ type: 'count', ...extra });
  }, [getChartData]);
  const [state, updater] = useUpdate({
    abnormalHostNum: 0,
  });

  useEffect(() => {
    getChartList({ clusters });
  }, [timeSpan, clusters, getChartList]);

  useEffect(() => {
    if (isEmpty(machineList)) {
      updater.abnormalHostNum(0);
      return;
    }

    getMachineStatus(map(machineList, ({ ip }) => ip))
      .then((hosts: any[]) => {
        const abnormalHostNum = filter(hosts, ({ status_level }) => status_level !== 'normal').length;
        updater.abnormalHostNum(abnormalHostNum);
      });
  }, [getMachineStatus, machineList, updater]);

  useEffect(() => {
    getInstanceList({
      clusters,
      instanceType: 'service',
      isWithoutOrg: true,
      filters: [
        {
          key: 'org_name',
          values: [orgName],
        },
      ],
    });
    getInstanceList({
      clusters,
      instanceType: 'job',
    });
  }, [clusters, getInstanceList, orgName]);

  const data = find(chartList, v => v === undefined) ? [] : chartList;
  const hostNum = reduce(clusters, (result, item) => result + item.hostIPs.length, 0);
  const serviceNum = serviceList.length;
  const jobNum = jobList.length;
  const groupIndices = [
    {
      type: 'machine',
      name: i18n.t('machine'),
      value: hostNum,
    },
    {
      type: 'service',
      name: i18n.t('service'),
      value: serviceNum,
    },
    {
      type: 'job',
      name: i18n.t('task'),
      value: jobNum,
    },
    {
      type: 'machine',
      name: `${i18n.t('dcos:abnormal machine')}`,
      value: state.abnormalHostNum,
      isWithErrorClass: true,
    },
  ];

  return (
    <>
      <div className="group-indices-ct mb32">
        <Row type="flex" justify="space-between">
          {
            map(groupIndices, ({ type, name, value, isWithErrorClass }: any) => (
              <Col span={5} key={name}>
                <div className="group-indices-item hover-active" onClick={() => { setActiveKey(type); }}>
                  <div className="title mb12">{name}</div>
                  <div
                    className={classNames({
                      num: true,
                      'error-num': isWithErrorClass && value > 0,
                    })}
                  >
                    {value}
                  </div>
                </div>
              </Col>
            ))
          }
        </Row>
      </div>
      <div className="chart-list">
        <TimeSelector defaultTime={24} />
        <Spin spinning={loading}>
          <Holder when={isEmpty(data)}>
            <Row gutter={24}>
              {
                compact(data).map(item => (
                  <Col key={item.title} span={8}>
                    <ChartContainer title={item.title}>
                      <MonitorChartNew
                        timeSpan={timeSpan}
                        data={item}
                        title={item.title}
                      />
                    </ChartContainer>
                  </Col>
                ))
              }
            </Row>
          </Holder>
        </Spin>
      </div>
    </>
  );
};

export default ResourcesChartList;
