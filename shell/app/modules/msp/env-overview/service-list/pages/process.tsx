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
import { getInstanceIds, getServiceLanguage } from 'msp/services/topology-service-analyze';
import RadioTabs from 'common/components/radio-tabs';
import EmptyHolder from 'common/components/empty-holder';
import DiceConfigPage from 'config-page';
import './index.scss';

const MONITOR_TYPE: { value: IState['monitorType']; label: string }[] = [
  {
    value: 'runtime',
    label: i18n.t('msp:runtime monitor'),
  },
  {
    value: 'container',
    label: i18n.t('msp:container monitor'),
  },
  {
    value: 'host',
    label: i18n.t('msp:host monitor'),
  },
];

const runtimeGridSpan = {
  nodejs: [12, 12, 12, 12, 12, 12],
  java: [12, 12, 8, 8, 8, 12, 12, 12, 12],
};

interface IState {
  instanceId: string;
  hostIP: string;
  monitorType: 'container' | 'runtime' | 'host';
}

const ServiceListProcess = () => {
  const range = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan.range);
  const { terminusKey } = routeInfoStore.useStore((s) => s.params);
  const [serviceId, serviceName, requestCompleted] = serviceAnalyticsStore.useStore((s) => [
    s.serviceId,
    s.serviceName,
    s.requestCompleted,
  ]);
  const [{ monitorType, instanceId, hostIP }, updater, update] = useUpdate<IState>({
    monitorType: MONITOR_TYPE[0].value,
    instanceId: '',
    hostIP: '',
  });
  const [instances, isFetchInstance] = getInstanceIds.useState();
  const [languages, isFetchLanguage] = getServiceLanguage.useState();

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

  React.useEffect(() => {
    if (monitorType === 'runtime' && serviceId) {
      getServiceLanguage.fetch({
        serviceId,
        tenantId: terminusKey,
      });
    }
  }, [serviceId, terminusKey, monitorType]);

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
          label: t.hostIp || t.instanceId,
          icon: '',
        })),
        customProps: {
          mode: 'single',
        },
      },
    ];
    update({
      instanceId: defaultInstance.instanceId,
      hostIP: defaultInstance.hostIp,
    });
    return [filter, { instanceId: defaultInstance.instanceId }];
  }, [instances?.data, instanceId]);

  const [scenarioName, scenarioParams] = React.useMemo(() => {
    let scenario;
    let params: Record<string, string> = {
      serviceId,
      instanceId,
      tenantId: terminusKey,
    };
    if (monitorType === 'container') {
      scenario = 'resources-container-monitor';
    } else if (monitorType === 'host') {
      params = {
        hostIP,
      };
      scenario = 'resources-node-monitor';
    } else if (languages?.language) {
      scenario = `resources-runtime-monitor-${languages.language}`;
    }
    return [scenario, params];
  }, [monitorType, languages?.language, hostIP, instanceId, serviceId, terminusKey]);

  const handleChangeInstance = React.useCallback(
    (data: { instanceId: string }) => {
      const instance = instances?.data.find((t) => t.instanceId === data.instanceId);
      update({
        instanceId: data.instanceId,
        hostIP: instance?.hostIp,
      });
    },
    [instances?.data],
  );

  if (!serviceId && requestCompleted) {
    return <NoServicesHolder />;
  }

  return (
    <Spin spinning={isFetchInstance || isFetchLanguage}>
      <div className="flex justify-between items-center flex-wrap mb-2">
        <RadioTabs defaultValue={MONITOR_TYPE[0].value} options={MONITOR_TYPE} onChange={updater.monitorType} />
        <div className="left flex items-center">
          {conditions.length ? (
            <ContractiveFilter
              key={defaultQuery?.instanceId}
              conditions={conditions}
              initValue={defaultQuery}
              onChange={handleChangeInstance}
              delay={100}
            />
          ) : null}
          <TimeSelectWithStore className="m-0 ml-3" />
        </div>
      </div>
      {scenarioName && instanceId ? (
        <DiceConfigPage
          className="overflow-visible"
          key={scenarioName + serviceId + instanceId}
          scenarioType={scenarioName}
          scenarioKey={scenarioName}
          forceUpdateKey={['inParams']}
          inParams={{
            startTime: range.startTimeMs,
            endTime: range.endTimeMs,
            _: range.triggerTime,
            ...scenarioParams,
          }}
          customProps={{
            runtime: {
              props: {
                gutter: 8,
                span: runtimeGridSpan[languages?.language ?? 'nodejs'],
                className: 'mb-2 overflow-visible',
                wrapperClassName: 'overflow-visible',
              },
            },
            node: {
              props: {
                gutter: 8,
                span: [12, 12, 12, 12, 12, 12],
                className: 'mb-2 overflow-visible',
                wrapperClassName: 'overflow-visible',
              },
            },
            container: {
              props: {
                gutter: 8,
                span: [12, 12, 12, 12],
                className: 'mb-2 overflow-visible',
                wrapperClassName: 'overflow-visible',
              },
            },
          }}
        />
      ) : (
        <EmptyHolder relative />
      )}
    </Spin>
  );
};

export default ServiceListProcess;
