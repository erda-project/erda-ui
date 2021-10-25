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
import { Select } from 'antd';
import { map, isEmpty } from 'lodash';
import i18n from 'i18n';
import { useUnmount } from 'react-use';
import monitorCommonStore from 'common/stores/monitorCommon';
import SICommonStore from '../../stores/common';
import routeInfoStore from 'core/stores/route';

const { Option } = Select;

interface IProps {
  type: string;
  api: string;
  query: object;
  dataHandler: (...args: any) => any;
}

const InstanceSelector = (props: IProps) => {
  const { type, api, query, dataHandler } = props;
  const timeSpan = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan.range);
  const [instanceMap, baseInfo, chosenInstance] = SICommonStore.useStore((s) => [
    s.instanceMap,
    s.baseInfo,
    s.chosenInstance,
  ]);
  const [serviceName, routeQuery] = routeInfoStore.useStore((s) => [s.params.serviceName, s.query]);
  const { getInstanceList } = SICommonStore.effects;
  const { setChosenInstance, clearChosenInstance } = SICommonStore.reducers;
  const { terminusKey, runtimeName, applicationId } = baseInfo;
  useUnmount(() => {
    clearChosenInstance();
  });

  React.useEffect(() => {
    const { startTimeMs, endTimeMs } = timeSpan;
    const filterQuery = {
      ...query,
      start: startTimeMs,
      end: endTimeMs,
      filter_terminus_key: terminusKey,
      filter_service_name: serviceName,
      filter_runtime_name: runtimeName,
      filter_application_id: applicationId,
    };
    const reqObj = {
      fetchApi: api,
      query: filterQuery,
      dataHandler,
      type,
    };
    getInstanceList(reqObj);
  }, [api, applicationId, dataHandler, getInstanceList, query, runtimeName, serviceName, terminusKey, timeSpan, type]);

  React.useEffect(() => {
    if (!chosenInstance[type] && !isEmpty(instanceMap[type])) {
      // 为空
      setChosenInstance({ type, instance: routeQuery.insId || instanceMap[type][0].value });
    }
  }, [chosenInstance, instanceMap, routeQuery.insId, setChosenInstance, type]);

  const onChange = (instance: string) => {
    setChosenInstance({ type, instance });
  };

  return (
    <Select
      onChange={onChange}
      placeholder={i18n.t('msp:please select an instance')}
      style={{ width: '200px' }}
      dropdownMatchSelectWidth={false}
      value={chosenInstance[type]}
    >
      {map(instanceMap[type], (ins: any) => (
        <Option key={ins.value} value={ins.value}>
          {ins.name}
        </Option>
      ))}
    </Select>
  );
};

export default InstanceSelector;
