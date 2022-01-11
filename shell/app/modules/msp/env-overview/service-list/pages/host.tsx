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
import i18n from 'i18n';
import { Spin } from 'antd';
import { useUpdate } from 'common/use-hooks';
import routeInfoStore from 'core/stores/route';
import monitorCommonStore from 'common/stores/monitorCommon';
import { TimeSelectWithStore } from 'msp/components/time-select';
import ContractiveFilter from 'common/components/contractive-filter';
import serviceAnalyticsStore from 'msp/stores/service-analytics';
import NoServicesHolder from 'msp/env-overview/service-list/pages/no-services-holder';
import { getInstanceIds } from 'msp/services/topology-service-analyze';
import DiceConfigPage from 'config-page';
import './index.scss';

interface IState {
  instanceId: string;
  hostIP: string;
}

const Host = () => {
  const range = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan.range);
  const { terminusKey } = routeInfoStore.useStore((s) => s.params);
  const [serviceId, serviceName, requestCompleted] = serviceAnalyticsStore.useStore((s) => [
    s.serviceId,
    s.serviceName,
    s.requestCompleted,
  ]);
  const [{ instanceId, hostIP }, _updater, update] = useUpdate<IState>({
    instanceId: '',
    hostIP: '',
  });
  const [instances, isFetchInstance] = getInstanceIds.useState();

  React.useEffect(() => {
    if (serviceId) {
      getInstanceIds.fetch({
        serviceName,
        serviceId,
        terminusKey,
        start: range.startTimeMs,
        end: range.endTimeMs,
      });
    }
  }, [serviceName, terminusKey, range, serviceId]);

  const [conditions, defaultQuery] = React.useMemo(() => {
    if (!instances?.data?.length) {
      return [[], undefined];
    }
    const defaultInstance = instances.data.find((t) => t.instanceId === instanceId) ?? instances.data[0];
    const filter = [
      {
        label: i18n.t('dop:select instance'),
        type: 'select',
        fixed: true,
        showIndex: 1,
        key: 'instanceId',
        options: instances.data.map((t) => ({
          value: t.instanceId,
          label: t.ip || t.instanceId,
          icon: '',
        })),
        customProps: {
          mode: 'single',
        },
      },
    ];
    update({
      instanceId: defaultInstance.instanceId,
      hostIP: defaultInstance.ip,
    });
    return [filter, { instanceId: defaultInstance.instanceId }];
  }, [instances?.data, instanceId]);

  const handleChangeInstance = React.useCallback(
    (data: { instanceId: string }) => {
      const instance = instances?.data.find((t) => t.instanceId === data.instanceId);
      update({
        instanceId: data.instanceId,
        hostIP: instance?.ip,
      });
    },
    [instances?.data],
  );

  if (!serviceId && requestCompleted) {
    return <NoServicesHolder />;
  }

  return (
    <Spin spinning={isFetchInstance}>
      <div className="flex justify-end items-center flex-wrap mb-2">
        <div className="left flex items-center">
          {conditions.length ? (
            <ContractiveFilter
              conditions={conditions}
              initValue={defaultQuery}
              onChange={handleChangeInstance}
              delay={100}
            />
          ) : null}
          <TimeSelectWithStore className="m-0 ml-3" />
        </div>
      </div>
      {hostIP ? (
        <DiceConfigPage
          scenarioType="resources-node-monitor"
          scenarioKey="resources-node-monitor"
          forceUpdateKey={['inParams']}
          inParams={{
            startTime: range.startTimeMs,
            endTime: range.endTimeMs,
            _: range.triggerTime,
            hostIP,
          }}
          customProps={{
            node: {
              props: {
                gutter: 8,
                span: [12, 12, 12, 12, 12, 12],
                className: 'mb-2',
              },
            },
          }}
        />
      ) : null}
    </Spin>
  );
};

export default Host;
