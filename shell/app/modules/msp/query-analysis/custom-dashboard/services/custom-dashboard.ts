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

import agent from 'agent';
import { apiCreator } from 'core/service';

const apis = {
  getCustomDashboardCreators: {
    api: '/api/dashboard/blocks/creators',
  },
  exportCustomDashboard: {
    api: 'post@/api/dashboard/blocks/export',
  },
  importCustomDashboard: {
    api: 'post@/api/dashboard/blocks/import',
  },
  getCustomDashboardOperationRecord: {
    api: '/api/dashboard/blocks/operate/history',
  },
  parseCustomDashboardFile: {
    api: 'post@/api/dashboard/blocks/parse',
  },
};

export const getCustomDashboardCreators = apiCreator<(p: Custom_Dashboard.CommonParams) => { creators: string[] }>(
  apis.getCustomDashboardCreators,
);

export const exportCustomDashboard = apiCreator<(p: Custom_Dashboard.ExportParams) => void>(
  apis.getCustomDashboardCreators,
);

export const importCustomDashboard = apiCreator<(p: Custom_Dashboard.ImportParams) => void>(
  apis.getCustomDashboardCreators,
);

// TODO: 返回类型再改改
export const getDashboardOperationRecord = apiCreator<(p: Custom_Dashboard.GetDashboardPayload) => void>(
  apis.getCustomDashboardOperationRecord,
);

export const createCustomDashboard = (payload: Custom_Dashboard.DashboardItem) => {
  return agent
    .post('/api/tmc/dashboard/blocks')
    .query({ scopeId: payload.scopeId })
    .send(payload)
    .then((response: any) => response.body);
};

export const updateCustomDashboard = (payload: Custom_Dashboard.DashboardItem) => {
  return agent
    .put(`/api/tmc/dashboard/blocks/${payload.id}`)
    .query({ scopeId: payload.scopeId })
    .send(payload)
    .then((response: any) => response.body);
};

export const deleteCustomDashboard = ({ id, scopeId }: { id: string; scopeId: string }) => {
  return agent
    .delete(`/api/tmc/dashboard/blocks/${id}`)
    .query({ scopeId })
    .then((response: any) => response.body);
};

export const getCustomDashboardDetail = ({
  id,
  scopeId,
}: {
  id: string;
  scopeId: string;
}): Custom_Dashboard.DashboardItem => {
  return agent
    .get(`/api/tmc/dashboard/blocks/${id}`)
    .query({ scopeId })
    .then((response: any) => response.body);
};

export const getCustomDashboard = (
  payload: Custom_Dashboard.GetDashboardPayload,
): IPagingResp<Custom_Dashboard.DashboardItem> => {
  return agent
    .get('/api/tmc/dashboard/blocks')
    .query(payload)
    .then((response: any) => response.body);
};

export const getChartData = ({ url, query }: { url: string; query?: any }) =>
  agent
    .get(url)
    .query(query)
    .then((response: any) => response.body);
