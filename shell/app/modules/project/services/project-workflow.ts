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
import { ENV_MAP, FlowType } from 'project/common/config';

export type EnvType = keyof typeof ENV_MAP;

export interface WorkflowHint {
  place: 'TASK' | 'BUG';
  changeBranchRule: string;
}

interface SingleBranchWorkflow {
  flowType: FlowType.SINGLE_BRANCH;
}

interface TwoBranchWorkflow {
  flowType: FlowType.TWO_BRANCH;
  autoMergeBranch: string;
  changeBranch: string;
  enableAutoMerge: boolean;
  startWorkflowHints: WorkflowHint[];
}

interface ThreeBranchWorkflow {
  flowType: FlowType.THREE_BRANCH;
  autoMergeBranch: string;
  changeFromBranch: string;
  changeBranch: string;
  enableAutoMerge: boolean;
  startWorkflowHints: WorkflowHint[];
}

export type WorkflowItem = {
  name: string;
  targetBranch: string;
  artifact: string;
  environment: EnvType;
} & (SingleBranchWorkflow | TwoBranchWorkflow | ThreeBranchWorkflow);

interface Workflow {
  id: string;
  flows: WorkflowItem[];
  orgID: number;
  orgName: string;
  projectID: number;
  projectName: string;
  timeCreated: string;
  timeUpdated: string;
  creator: string;
  updater: string;
}

export interface CreateFlowNode {
  issueID: number;
  appID: number;
  sourceBranch: string;
  targetBranch: string;
}

export interface DevFlowNode {
  repoMergeID: number;
  appID: number;
  targetBranch: string;
  sourceBranch: string;
  isJoinTempBranch: boolean;
  status: string;
  tempBranch: string;
  issueID: number;
  mergeID: number;
}

export interface PipelineInfo {
  status: string;
  pipelineID: number;
  ymlName: string;
  mergeID: number;
  repoMergeID: number;
}

export interface ChangeBranch {
  commit: string;
  branchName: string;
  status: 'success' | 'faild';
  repoMergeID: number;
}

export interface DevFlowInfo {
  devFlowNode: DevFlowNode;
  pipelineStepInfos: PipelineInfo[];
  changeBranch: ChangeBranch[];
}

export type FlowStatus = 'none' | 'mergeFailed' | 'pipelineNotRun' | 'pipelineFiled' | 'pipelineRunning' | 'success';

export interface DevFlowInfos {
  status: FlowStatus;
  devFlowInfos: DevFlowInfo[];
}

const apis = {
  queryWorkflow: {
    api: 'get@/api/devFlowRule/actions/get-by-projectID',
  },
  updateWorkflow: {
    api: 'put@/api/devFlowRule/:id',
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
  deleteFlowNode: {
    api: 'delete@/api/devflow/:mergeID',
  },
  updateDeploy: {
    api: 'put@/api/devflow/:mergeID/actions/operation-deploy',
  },
  restartDeploy: {
    api: 'post@/api/devflow/actions/restart-deploy',
  },
  getPipelineDetail: {
    api: 'get@/api/pipelines/:pipelineID',
  },
};

export const queryWorkflow = apiCreator<(payload: { projectID: number }) => Workflow>(apis.queryWorkflow);

export const updateWorkflow = apiCreator<(payload: { id: string; flows: WorkflowItem[] }) => Workflow>(
  apis.updateWorkflow,
);

export const getBranches = apiCreator<(payload: { projectName: string; appName: string }) => REPOSITORY.IBranch[]>(
  apis.getBranches,
);

export const getFlowList = apiCreator<
  (payload: { projectID: number; mergeID: number } | { projectID: number; issueID: number }) => DevFlowInfos
>(apis.getFlowList);

export const createFlow = apiCreator<(payload: CreateFlowNode) => DevFlowNode>(apis.createFlow);

export const updateDeploy = apiCreator<(payload: { mergeID: number; appID: number; enable: boolean }) => DevFlowNode>(
  apis.updateDeploy,
);
export const restartDeploy = apiCreator<(payload: { mergeID: number; appID: number }) => DevFlowNode>(
  apis.restartDeploy,
);

export const deleteFlowNode = apiCreator<(payload: { mergeID: number }) => DevFlowNode>(apis.deleteFlowNode);
export const getPipelineDetail = apiCreator<(payload: { pipelineID: number }) => BUILD.IPipelineDetail>(
  apis.getPipelineDetail,
);
