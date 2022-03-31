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
