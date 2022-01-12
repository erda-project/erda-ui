import { apiCreator } from 'core/service';

const apis = {
  getDeployOrders: {
    api: '/api/deployment-orders',
  },
  getDeployOrderDetail: {
    api: '/api/deployment-orders/:deploymentOrderId',
  },
  getRelease: {
    api: '/api/releases',
  },
  getReleaseRenderDetail: {
    api: '/api/deployment-orders/actions/render-detail',
  },
  startDeploy: {
    api: 'post@/api/deployment-orders/:deploymentOrderID/actions/deploy',
  },
  cancelDeploy: {
    api: 'post@/api/deployment-orders/:deploymentOrderID/actions/cancel',
  },
  createDeploy: {
    api: 'post@/api/deployment-orders',
  },
};

export const getDeployOrders = apiCreator<(params: PROJECT_DEPLOY.DeployOrderReq) => PROJECT_DEPLOY.DeployOrderRes>(
  apis.getDeployOrders,
);

export const getDeployOrderDetail = apiCreator<(params: PROJECT_DEPLOY.DeployDetailReq) => PROJECT_DEPLOY.DeployDetail>(
  apis.getDeployOrderDetail,
);

export const getRelease = apiCreator<(params: PROJECT_DEPLOY.ReleaseReq) => IPagingResp<PROJECT_DEPLOY.Release>>(
  apis.getRelease,
);

export const getReleaseRenderDetail = apiCreator<
  (params: PROJECT_DEPLOY.ReleaseRenderDetailReq) => PROJECT_DEPLOY.ReleaseRenderDetail
>(apis.getReleaseRenderDetail);

export const startDeploy = apiCreator<(params: { deploymentOrderID: string }) => void>(apis.startDeploy);

export const cancelDeploy = apiCreator<
  (params: { deploymentOrderID: string; force: boolean }) => PROJECT_DEPLOY.ReleaseRenderDetail
>(apis.cancelDeploy);

export const createDeploy = apiCreator<
  (params: { releaseId: string; workspace: string }) => PROJECT_DEPLOY.DeployOrder
>(apis.createDeploy);
