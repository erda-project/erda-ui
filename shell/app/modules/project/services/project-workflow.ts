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
import { ENV_MAP } from 'project/common/config';

export type EnvType = keyof typeof ENV_MAP;

export interface CreateFlowNode {
  issueID: number;
  appID: number;
  sourceBranch: string;
  targetBranch: string;
}

interface Commit {
  id: string;
  author: string;
  committer: { email: string; name: string; When: string };
  commitMessage: string;
  parentSha: string;
}
export interface DevFlowNode {
  repoMergeID: number;
  appID: number;
  appName: string;
  targetBranch: string;
  sourceBranch: string;
  isJoinTempBranch: boolean;
  status: string;
  tempBranch: string;
  issueID: number;
  mergeID: number;
  canJoin: boolean;
  commit: null | Commit;
  baseCommit: null | Commit;
}

export interface PipelineInfo {
  status: string;
  pipelineID: number;
  ymlName: string;
  mergeID: number;
  repoMergeID: number;
}

export interface ChangeBranch {
  commit: Commit;
  branchName: string;
  status: 'success' | 'faild';
  repoMergeID: number;
}

export interface DevFlowInfo {
  hasPermission: boolean;
  hasOnPushBranch: boolean;
  inode: string;
  pInode: string;
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
  tempMerge: {
    api: 'put@/api/devflow/:mergeId/actions/operation-merge',
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
  getBranchPolicy: {
    api: 'get@/api/devFlowRule/actions/get-by-projectID',
  },
  updateBranchPolicy: {
    api: 'put@/api/devFlowRule/:id',
  },
};

export const tempMerge = apiCreator<(payload: { mergeId: number; enable: boolean }) => void>(apis.tempMerge);

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

export interface BranchPolicy {
  branch: string;
  branchType: string;
  policy: null | {
    sourceBranch: string;
    currentBranch: string;
    tempBranch: string;
    targetBranch:
      | null
      | undefined
      | {
          mergeRequest: string;
          cherryPick: string | undefined;
        };
  };
}

export interface BranchFlows {
  name: string;
  targetBranch: string;
  artifact: string;
  environment: string;
}

export interface DevOpsWorkFlow {
  id: string;
  flows: BranchFlows[];
  branchPolicies: BranchPolicy[];
}

export const getBranchPolicy = apiCreator<(payload: { projectID: string }) => DevOpsWorkFlow>(apis.getBranchPolicy);

export const updateBranchPolicy = apiCreator<(payload: DevOpsWorkFlow) => DevOpsWorkFlow>(apis.updateBranchPolicy);
