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

import i18n from 'i18n';
import { createFlatStore } from 'app/cube';
import { getDefaultPaging, getTimeSpan } from 'common/utils';
import breadcrumbStore from 'app/layout/stores/breadcrumb';

import * as orgCustomDashboardService from 'dataCenter/services/custom-dashboard';
import * as microServiceCustomDashboardService from 'microService/monitor/custom-dashboard/services/custom-dashboard';

export enum CustomDashboardScope {
  ORG = 'org',
  MICRO_SERVICE = 'micro_service',
}

export interface IState {
  customDashboardList: Custom_Dashboard.DashboardItem[];
  customDashboardPaging: IPaging;
  timeSpan: any;
}

export const createCustomDashboardStore = (scope: CustomDashboardScope) => {
  const serviceMap = {
    [CustomDashboardScope.ORG]: orgCustomDashboardService,
    [CustomDashboardScope.MICRO_SERVICE]: microServiceCustomDashboardService,
  };
  const initState: IState = {
    customDashboardList: [],
    customDashboardPaging: getDefaultPaging(),
    timeSpan: getTimeSpan(),
  };
  const {
    getCustomDashboard,
    createCustomDashboard,
    deleteCustomDashboard,
    updateCustomDashboard,
    getCustomDashboardDetail,
  } = serviceMap[scope];

  const customDashboardStore = createFlatStore({
    name: `${scope}CustomDashboard`,
    state: initState,
    effects: {
      async createCustomDashboard({ call }, payload: Custom_Dashboard.DashboardItem) {
        await call(createCustomDashboard, payload, { successMsg: i18n.t('org:add O & M dashboard success') });
      },
      async updateCustomDashboard({ call }, payload: Custom_Dashboard.DashboardItem) {
        await call(updateCustomDashboard, payload, { successMsg: i18n.t('org:update O & M dashboard success') });
      },
      async getCustomDashboard({ call, update }, payload: Custom_Dashboard.GetDashboardPayload) {
        const { list } = await call(getCustomDashboard, payload, { paging: { key: 'customDashboardPaging' } });
        update({ customDashboardList: list });
      },
      async getCustomDashboardDetail({ call }, payload: { id: string; scopeId: string }) {
        const customDashboardDetail = await call(getCustomDashboardDetail, payload);
        breadcrumbStore.reducers.setInfo('dashboardName', customDashboardDetail.name);
        return customDashboardDetail;
      },
      async deleteCustomDashboard({ call }, payload: { id: string; scopeId: string }) {
        await call(deleteCustomDashboard, payload, { successMsg: i18n.t('deleted successfully') });
      },
    },
    reducers: {
      updateTimeSpan(state, payload) {
        state.timeSpan = payload;
      },
      resetTimeSpan(state) {
        state.timeSpan = getTimeSpan();
      },
    },
  });

  return customDashboardStore;
};
