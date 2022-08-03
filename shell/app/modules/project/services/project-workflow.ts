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
    mock1() {
      return {
        data: {
          devFlowInfos: [
            {
              devFlow: {
                id: '84f49f3e-d906-4299-9062-3a70c29785ff',
                orgID: 1,
                orgName: 'erda',
                creator: '2',
                branch: 'feature/3140',
                issueID: 314,
                flowRuleName: 'DEV',
                appID: 10,
                appName: 'go-demo',
                joinTempBranchStatus: '',
                isJoinTempBranch: false,
                createdAt: '2022-08-01T08:21:33Z',
                updatedAt: '2022-08-01T08:21:33Z',
              },
              hasPermission: true,
              codeNode: {
                currentBranch: 'feature/3140',
                commit: {
                  id: 'b7f0a5b2ac66b833bce8dbfe185e8f6a23660f81',
                  author: null,
                  committer: {
                    email: 'dice@dice.terminus.io',
                    name: 'dice',
                    When: '2022-07-20T07:08:55Z',
                  },
                  commitMessage: 'Update custom-yml',
                  parentSha: '',
                },
                isJoinTempBranch: false,
                joinTempBranchStatus: '',
                canJoin: true,
                exist: true,
              },
              tempMergeNode: {
                tempBranch: 'next/develop',
                baseCommit: null,
                changeBranch: [],
              },
              pipelineNode: {
                pipelineStepInfos: [],
              },
              mergeRequestNode: {
                currentBranch: 'feature/3140',
                targetBranch: 'master',
                title: 'Automatic merge requests for feature/3140',
                desc: '任务: #314 这是一个很nice的任务',
                mergeRequestInfo: null,
              },
            },
            {
              devFlow: {
                id: '24aed4b7-7c49-479f-af84-8e1c93b00f64',
                orgID: 1,
                orgName: 'erda',
                creator: '2',
                branch: 'feature/3140',
                issueID: 314,
                flowRuleName: 'DEV',
                appID: 9,
                appName: 'go-web',
                joinTempBranchStatus: 'success',
                isJoinTempBranch: true,
                createdAt: '2022-08-01T06:18:30Z',
                updatedAt: '2022-08-01T06:27:18Z',
              },
              hasPermission: true,
              codeNode: {
                currentBranch: 'feature/3140',
                commit: {
                  id: '2e15716475fc7c8504d229f90eb488fccda37821',
                  author: null,
                  committer: {
                    email: '17816869670@163.com',
                    name: 'wxjcc',
                    When: '2022-07-12T09:37:03Z',
                  },
                  commitMessage: 'Update timeout-yml',
                  parentSha: '',
                },
                isJoinTempBranch: true,
                joinTempBranchStatus: 'success',
                canJoin: false,
                exist: true,
              },
              tempMergeNode: {
                tempBranch: 'next/develop',
                baseCommit: {
                  id: '2e15716475fc7c8504d229f90eb488fccda37821',
                  author: null,
                  committer: {
                    email: '17816869670@163.com',
                    name: 'wxjcc',
                    When: '2022-07-12T09:37:03Z',
                  },
                  commitMessage: 'Update timeout-yml',
                  parentSha: '',
                },
                changeBranch: [
                  {
                    commit: {
                      id: '2e15716475fc7c8504d229f90eb488fccda37821',
                      author: null,
                      committer: {
                        email: '17816869670@163.com',
                        name: 'wxjcc',
                        When: '2022-07-12T09:37:03Z',
                      },
                      commitMessage: 'Update timeout-yml',
                      parentSha: '',
                    },
                    branchName: 'feature/3140',
                    status: '',
                  },
                ],
              },
              pipelineNode: {
                pipelineStepInfos: [
                  {
                    status: '',
                    pipelineID: 0,
                    ymlName: 'pipeline.yml',
                    hasOnPushBranch: false,
                    inode: 'NS85L3RyZWUvbmV4dC9kZXZlbG9wL3BpcGVsaW5lLnltbA==',
                    pInode: 'NS85L3RyZWUvbmV4dC9kZXZlbG9w',
                  },
                ],
              },
              mergeRequestNode: {
                currentBranch: 'feature/3140',
                targetBranch: 'master',
                title: '123',
                desc: '123',
                mergeRequestInfo: {
                  id: 123,
                  mergeId: 21,
                  appId: 0,
                  repoId: 0,
                  title: '123',
                  authorId: '2',
                  description: '',
                  assigneeId: '',
                  mergeUserId: '',
                  closeUserId: '',
                  sourceBranch: '',
                  targetBranch: '',
                  sourceSha: '',
                  targetSha: '',
                  removeSourceBranch: false,
                  state: 'open',
                  isCheckRunValid: false,
                  defaultCommitMessage: '',
                  createdAt: null,
                  link: '',
                  score: 0,
                  scoreNum: 0,
                  rebaseBranch: '',
                  eventName: '',
                  checkRuns: null,
                  joinTempBranchStatus: '',
                  isJoinTempBranch: false,
                },
              },
            },
          ],
        },
      };
    },
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
