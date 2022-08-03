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
  tempMerge: {
    api: 'put@/api/devflow/:devFlowID/actions/operation-merge',
  },
  getBranches: {
    api: 'get@/api/repo/:projectName/:appName/branches',
  },
  getFlowList: {
    api: 'get@/api/devflow/actions/info',
  },
  createFlow: {
    api: 'post@/api/devflow',
  },
  getPipelineDetail: {
    api: 'get@/api/pipelines/:pipelineID',
  },
  getBranchPolicy: {
    api: 'get@/api/devFlowRule/actions/get-by-projectID',
  },
  updateBranchPolicy: {
    api: 'put@/api/devFlowRule/:id',
  },
};

export const tempMerge = apiCreator<(payload: { devFlowID: string; enable: boolean }) => void>(apis.tempMerge);

export const getBranches = apiCreator<(payload: { projectName: string; appName: string }) => REPOSITORY.IBranch[]>(
  apis.getBranches,
);

export const getFlowList = apiCreator<
  (
    payload: { projectID: number; mergeID: number } | { projectID: number; issueID: number },
  ) => DEVOPS_WORKFLOW.DevFlowInfos
>(apis.getFlowList);

export const createFlow = apiCreator<(payload: DEVOPS_WORKFLOW.CreateFlowNode) => void>(apis.createFlow);

export const getPipelineDetail = apiCreator<(payload: { pipelineID: number }) => BUILD.IPipelineDetail>(
  apis.getPipelineDetail,
);

export const getBranchPolicy = apiCreator<(payload: { projectID: string }) => DEVOPS_WORKFLOW.DevOpsWorkFlow>(
  apis.getBranchPolicy,
);

export const updateBranchPolicy = apiCreator<
  (payload: DEVOPS_WORKFLOW.DevOpsWorkFlow) => DEVOPS_WORKFLOW.DevOpsWorkFlow
>(apis.updateBranchPolicy);
