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
import gatewayStore from 'microService/stores/gateway';

const { Option } = Select;

interface IProps {
  updateField: Function;
  dataSource: { diceApp: string; diceService: string };
}

export const AppServiceFilter = ({ updateField, dataSource }: IProps) => {
  const registerApps = gatewayStore.useStore((s) => s.registerApps);
  const [appList, setAppList] = React.useState([] as any[]);
  const [serviceList, setServiceList] = React.useState([] as any[]);
  const { diceApp, diceService } = dataSource;

  React.useEffect(() => {
    !isEmpty(registerApps) && setAppList(registerApps.map((app) => app.name));
  }, [registerApps]);

  const onAppChange = (appName: string) => {
    const targetApp = registerApps.find((rApp) => rApp.name === appName);
    setServiceList(targetApp.services);
    updateField({ diceApp: appName, diceService: targetApp.services[0] });
  };

  const onServiceChange = (serviceName: string) => {
    updateField({ diceService: serviceName });
  };

  return (
    <>
      <Select
        showSearch
        placeholder={i18n.t('microService:application')}
        value={diceApp}
        onChange={onAppChange}
        className="filter-select mr16"
      >
        {map(appList, (appName, key) => (
          <Option key={key} value={appName}>
            {appName}
          </Option>
        ))}
      </Select>
      <Select
        showSearch
        placeholder={i18n.t('microService:owned service')}
        value={diceService}
        onChange={onServiceChange}
        className="filter-select mr16"
      >
        {map(serviceList, (serviceName, key) => (
          <Option key={key} value={serviceName}>
            {serviceName}
          </Option>
        ))}
      </Select>
    </>
  );
};
