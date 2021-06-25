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
import { Select } from 'app/nusi';
import { isEmpty, map } from 'lodash';
import i18n from 'i18n';

import './api-policies-header.scss';
import routeInfoStore from 'common/stores/route';
import gatewayStore from 'msp/stores/gateway';

const { Option } = Select;

export const ApiPoliciesHeader = () => {
  const [appList, setAppList] = React.useState([] as any[]);
  const [serviceList, setServiceList] = React.useState([] as any[]);
  const [runtimeEntry, setRuntimeEntry] = React.useState(false);
  const query = routeInfoStore.useStore((s) => s.query);
  const [registerApps, runtimeEntryData, policyFilter] = gatewayStore.useStore((s) => [
    s.registerApps,
    s.runtimeEntryData,
    s.policyFilter,
  ]);
  const { updatePolicyFilter } = gatewayStore.reducers;
  const { diceApp, diceService } = policyFilter;

  React.useEffect(() => {
    if (registerApps.length > 0 && isEmpty(runtimeEntryData)) {
      const list = registerApps.map((app) => app.name);
      setAppList(list);
      if (diceApp) {
        const targetApp = registerApps.find((rApp) => rApp.name === diceApp);
        targetApp && setServiceList(targetApp.services);
      }
    }
  }, [diceApp, registerApps, runtimeEntryData]);

  React.useEffect(() => {
    if (!isEmpty(runtimeEntryData)) {
      const { diceApp: runtimeDiceApp, services } = runtimeEntryData;
      const serviceListKeys = Object.keys(services);
      if (isEmpty(policyFilter)) {
        updatePolicyFilter({ diceApp: runtimeDiceApp, diceService: serviceListKeys[0] });
      }
      setServiceList(serviceListKeys);
    }
  }, [policyFilter, runtimeEntryData, updatePolicyFilter]);

  React.useEffect(() => {
    const { appId, runtimeId } = query;
    appId && runtimeId && setRuntimeEntry(true);
  }, [query]);

  const onAppChange = (appName: string) => {
    const targetApp = registerApps.find((rApp) => rApp.name === appName);
    setServiceList(targetApp.services);
    updatePolicyFilter({ diceApp: appName, diceService: targetApp.services[0] });
  };

  const onServiceChange = (serviceName: string) => {
    updatePolicyFilter({ diceService: serviceName });
  };

  return (
    <section className="api-policies-header mb16">
      <div className={`app-service-select mr16 ${runtimeEntry ? 'hide' : ''}`}>
        <Select
          placeholder={i18n.t('msp:application name')}
          className="filter-select"
          value={diceApp}
          onChange={onAppChange}
        >
          {map(appList, (appName, key) => (
            <Option key={key} value={appName}>
              {appName}
            </Option>
          ))}
        </Select>
      </div>
      <div>
        <Select
          placeholder={i18n.t('msp:service name')}
          className="filter-select"
          value={diceService}
          onChange={onServiceChange}
        >
          {map(serviceList, (serviceName, key) => (
            <Option key={key} value={serviceName}>
              {serviceName}
            </Option>
          ))}
        </Select>
      </div>
    </section>
  );
};
