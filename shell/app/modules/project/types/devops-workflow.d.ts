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
    flowRuleName: string;
    currentBranch: string;
  }

  interface MergeRequestInfo {
    id: number;
    mergeId: number;
    state: string;
    title: string;
  }

  interface PipelineInfo {
    hasOnPushBranch: boolean;
    inode: string;
    pInode: string;
    pipelineID: number;
    status: string;
    ymlName: string;
  }

  interface ChangeBranch {
    commit: Commit;
    branchName: string;
    status: 'success' | 'faild';
  }
  interface DevFlowInfo {
    devFlow: DevFlowBase;
    codeNode: CodeNode;
    hasPermission: boolean;
    mergeRequestNode: MergeRequestNode;
    tempMergeNode: TempMergeNode;
    pipelineNode: PipelineNode;
  }

  interface PipelineNode {
    pipelineStepInfos: PipelineInfo[];
  }

  interface TempMergeNode {
    tempBranch: string;
    changeBranch: ChangeBranch[];
    baseCommit: null | Commit;
  }

  interface MergeRequestNode {
    currentBranch: string;
    desc: string;
    mergeRequestInfo: null | MergeRequestInfo;
    targetBranch: string;
    title: string;
  }

  interface CodeNode {
    currentBranch: string;
    commit: Commit;
    isJoinTempBranch: boolean;
    joinTempBranchStatus: string;
    canJoin: Boolean;
    exist: Boolean;
  }

  interface Commit {
    id: string;
    author: string;
    committer: {
      email: string;
      name: string;
      When: string;
    };
    commitMessage: string;
    parentSha: string;
  }

  interface DevFlowBase {
    id: string;
    orgID: number;
    appID: number;
    appName: string;
    creator: string;
    branch: string;
    issueID: number;
    flowRuleName: string;
    joinTempBranchStatus: string;
    isJoinTempBranch: boolean;
    createdAt: string;
    updatedAt: string;
  }

  type FlowStatus = 'none' | 'mergeFailed' | 'pipelineNotRun' | 'pipelineFiled' | 'pipelineRunning' | 'success';
  interface DevFlowInfos {
    devFlowInfos: DevFlowInfo[];
  }
}
