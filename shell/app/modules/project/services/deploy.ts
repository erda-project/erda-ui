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
  getProjectRuntimeCount: {
    api: '/api/countProjectRuntime',
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
  (params: { releaseId: string; workspace: string; id: string }) => PROJECT_DEPLOY.DeployOrder
>(apis.createDeploy);

export const getProjectRuntimeCount = apiCreator<(params: { projectId: string }) => PROJECT_DEPLOY.ProjectRuntimeCount>(
  apis.getProjectRuntimeCount,
);
