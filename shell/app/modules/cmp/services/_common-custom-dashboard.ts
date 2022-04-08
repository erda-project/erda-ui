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
  downloadApi: {
    api: '/api/files/:uuid',
  },
};

export const getCustomDashboardCreators = apiCreator<(p: Custom_Dashboard.CommonParams) => { creators: string[] }>(
  apis.getCustomDashboardCreators,
);

export const exportCustomDashboard = apiCreator<(p: Custom_Dashboard.ExportParams) => void>(apis.exportCustomDashboard);

export const importCustomDashboard = apiCreator<(p: Custom_Dashboard.ImportParams) => void>(apis.importCustomDashboard);

export const getDashboardOperationRecord = apiCreator<
  (p: Custom_Dashboard.GetDashboardPayload) => Custom_Dashboard.OperationDashboardRecord
>(apis.getCustomDashboardOperationRecord);

export const downloadApi = apiCreator<(p: { uuid: string }) => void>(apis.downloadApi);
