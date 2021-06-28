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

/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { map, isEmpty, find } from 'lodash';
import { Select } from 'app/nusi';
import monitorCommonStore from 'common/stores/monitorCommon';
import routeInfoStore from 'app/common/stores/route';
import { useMount } from 'react-use';
import i18n from 'i18n';

import './appSelector.scss';

const { Option } = Select;

interface IProps {
  changeApp: (args: any) => void;
}

const AppSelector = (props: IProps) => {
  const { changeApp } = props;
  const appList = monitorCommonStore.useStore((s) => s.projectApps);
  const [choosenApp, setChoosenApp] = React.useState([]);
  const query = routeInfoStore.useStore((s) => s.query);
  const { getProjectApps } = monitorCommonStore.effects;
  useMount(() => {
    getProjectApps();
  });

  React.useEffect(() => {
    if (query && !isEmpty(appList)) {
      const { appId }: any = query || {};
      if (appId !== undefined && find(appList, { id: Number(appId) })) {
        setChoosenApp([appId] as any);
      }
    }
  }, [query, appList]);

  React.useEffect(() => {
    changeApp(choosenApp);
  }, [choosenApp]);

  const handleChange = (apps: any) => {
    setChoosenApp(apps);
  };

  return (
    <Select
      mode="multiple"
      className="topology-app-select"
      placeholder={i18n.t('msp:select application')}
      value={choosenApp}
      onChange={handleChange}
    >
      {map(appList, ({ id, name }) => (
        <Option key={`${id}`} value={`${id}`}>
          {name}
        </Option>
      ))}
    </Select>
  );
};

export default AppSelector;
