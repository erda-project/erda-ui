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
import routeInfoStore from 'core/stores/route';
import serviceAnalyticsStore from 'msp/stores/service-analytics';
import { getServices } from 'msp/services/service-list';
import LoadMoreSelector from 'common/components/load-more-selector';
import Ellipsis from 'common/components/ellipsis';
import ErdaIcon from 'common/components/erda-icon';
import i18n from 'i18n';
import { useUnmount } from 'react-use';
import './service-name-select.scss';
import mspStore from 'msp/stores/micro-service';

export function ServiceNameSelect() {
  const [serviceId] = serviceAnalyticsStore.useStore((s) => [s.serviceId, s.serviceName]);
  const currentProject = mspStore.getState((s) => s.currentProject);
  const params = routeInfoStore.useStore((s) => s.params);
  const [serverListData, loading] = getServices.useState();
  const { updateState } = serviceAnalyticsStore;
  const serviceList = serverListData?.list || [];

  const configServiceData = (key: string) => {
    const service = serviceList.filter((v: MSP_SERVICES.SERVICE_LIST_ITEM) => v.id === key);
    const _serviceId = service[0]?.id || serviceList[0]?.id;
    const _serviceName = service[0]?.name || serviceList[0]?.name;
    const [applicationId] = _serviceId?.split('_') || [];
    updateState({
      serviceId: _serviceId ? window.decodeURIComponent(_serviceId) : '',
      serviceName: _serviceName,
      applicationId: currentProject?.type === 'MSP' ? '-' : applicationId,
    });
  };

  React.useEffect(() => {
    updateState({
      requestCompleted: !loading,
    });
  }, [loading]);

  React.useEffect(() => {
    getServices.fetch({
      pageNo: 1,
      pageSize: 1000,
      tenantId: params?.terminusKey,
    });
  }, []);

  React.useEffect(() => {
    if (serviceId) {
      configServiceData(serviceId);
    } else if (params?.serviceId) {
      configServiceData(window.decodeURIComponent(params?.serviceId));
    } else if (!serviceId && serviceList?.length > 0) {
      configServiceData(serviceId);
    }
  }, [params.serviceId, serviceId, serviceList, updateState]);

  useUnmount(() => {
    updateState({
      serviceId: '',
      serviceName: '',
      applicationId: '',
    });
  });

  const list = React.useMemo(
    () =>
      serviceList.map((item) => ({
        ...item,
        value: item.id,
        label: item.name,
      })),
    [serviceId, serviceList],
  );

  const handleChangeService = (serviceID: string) => {
    configServiceData(serviceID);
  };

  return (
    <div className="flex items-center service-name-select">
      <div className="font-bold text-lg">{i18n.t('msp:Service Monitoring')}</div>
      <span className="bg-black-2 mx-4 w-px h-3" />
      <div className="max-w-48">
        <LoadMoreSelector
          list={list}
          value={serviceId}
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ width: 300 }}
          onChange={handleChangeService}
          valueItemRender={(item) => {
            return (
              <div className="flex w-full pl-2 text-base group">
                <div className="w-full flex justify-between">
                  <Ellipsis className="font-bold" title={item.label} />
                  <ErdaIcon
                    type="caret-down"
                    className="icon ml-0.5 text-default-3 group-hover:text-default"
                    size="14"
                  />
                </div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
