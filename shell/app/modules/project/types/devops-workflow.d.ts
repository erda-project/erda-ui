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

declare namespace DEVOPS_WORKFLOW {
  interface BranchPolicy {
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

  interface BranchFlows {
    name: string;
    targetBranch: string;
    artifact: string;
    environment: string;
  }

  interface DevOpsWorkFlow {
    id: string;
    flows: BranchFlows[];
    branchPolicies: BranchPolicy[];
  }

  interface CreateFlowNode {
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
  interface DevFlowNode {
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

  interface PipelineInfo {
    status: string;
    pipelineID: number;
    ymlName: string;
    mergeID: number;
    repoMergeID: number;
  }

  interface ChangeBranch {
    commit: Commit;
    branchName: string;
    status: 'success' | 'faild';
    repoMergeID: number;
  }
  interface DevFlowInfo {
    hasPermission: boolean;
    hasOnPushBranch: boolean;
    inode: string;
    pInode: string;
    devFlowNode: DevFlowNode;
    pipelineStepInfos: PipelineInfo[];
    changeBranch: ChangeBranch[];
  }

  type FlowStatus = 'none' | 'mergeFailed' | 'pipelineNotRun' | 'pipelineFiled' | 'pipelineRunning' | 'success';
  interface DevFlowInfos {
    status: FlowStatus;
    devFlowInfos: DevFlowInfo[];
  }
}
