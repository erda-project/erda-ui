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

import React from 'react';
import { ErdaIcon } from 'common';
import i18n from 'i18n';
import { sortBy } from 'lodash';
import CodeCard from './cards/code';
import MergeCard from './cards/merge';
import PipelineCard from './cards/pipeline';
import MergeRequestCard from './cards/merge-request';

import './index.scss';

export interface IProps {
  scope: 'ISSUE' | 'MR';
  projectID: number;
  flowInfo: DEVOPS_WORKFLOW.DevFlowInfos;
  getFlowNodeList: () => void;
}

const WorkflowItem: React.FC<
  {
    data: DEVOPS_WORKFLOW.DevFlowInfo;
    disabled: boolean;
  } & Omit<IProps, 'flowInfo'>
> = ({ data, scope, getFlowNodeList, projectID, disabled }) => {
  const code = ({ index, className }: { index: number; className?: string }) => (
    <CodeCard
      disabled={disabled}
      index={index}
      data={data}
      projectID={`${projectID}`}
      className={className}
      reload={getFlowNodeList}
    />
  );
  const merge = ({ index, className }: { index: number; className?: string }) => (
    <MergeCard
      disabled={disabled}
      index={index}
      data={data}
      projectID={`${projectID}`}
      className={className}
      reload={getFlowNodeList}
    />
  );
  const pipeline = ({ index, className }: { index: number; className?: string }) => (
    <PipelineCard disabled={disabled} index={index} data={data} projectID={`${projectID}`} className={className} />
  );

  const mr = ({ index, className }: { index: number; className?: string }) => (
    <MergeRequestCard disabled={disabled} index={index} data={data} projectID={`${projectID}`} className={className} />
  );
  const split = ({ className }: { className?: string }) => (
    <div className={`w-5 h-[2px] bg-default-1 mt-7 ${className}`} />
  );

  const cardMap = {
    ISSUE: [code, split, merge, split, pipeline, split, mr],
    MR: [merge, split, pipeline],
  };

  const content = cardMap[scope];

  return (
    <div className="flex overflow-x-auto p-2 devops-workflow-steps">
      {content.map((Item, idx) => (
        <Item key={`${idx}`} index={idx / 2 + 1} className="flex-shrink-0" />
      ))}
    </div>
  );
};

const Workflow: React.FC<IProps> = ({ scope, projectID, getFlowNodeList, flowInfo }) => {
  const { devFlowInfos } = flowInfo ?? {};

  return (
    <>
      {sortBy(devFlowInfos, (item) => (item.codeNode?.exist ? 1 : 2))?.map((item, idx) => {
        const { hasPermission, devFlow } = item;
        const { appName = '', flowRuleName } = devFlow || {};

        return (
          <div key={idx} className="border-all rounded mb-2">
            <div className="px-4 py-2 flex-h-center border-bottom bg-default-02 justify-between ">
              <div className="flex-h-center">
                <ErdaIcon size={16} className="text-default-4" type="yingyongmingcheng" />
                <span className="ml-2 font-medium text-default">
                  {appName} {` (${i18n.t('dop:workflow')} - ${flowRuleName}) `}
                </span>
              </div>
              <ErdaIcon
                onClick={() => {
                  getFlowNodeList();
                }}
                size={18}
                type="shuaxin"
                className=" font-medium cursor-pointer text-default-6 hover:text-default-8"
              />
            </div>
            <div className="p-2">
              {!hasPermission ? (
                <div className="text-center flex-1 text-sub">
                  {i18n.t(
                    'dop:No permission to access the current application {name}, Contact the application administrator to add permission',
                    { name: appName },
                  )}
                </div>
              ) : (
                <WorkflowItem
                  disabled={item?.codeNode?.exist === false}
                  data={item}
                  scope={scope}
                  projectID={projectID}
                  getFlowNodeList={getFlowNodeList}
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

const d = [
  {
    devFlow: {
      id: 'e5934711-bfed-404a-b0f4-bb637c207237',
      orgID: 1,
      orgName: 'erda',
      creator: '2',
      branch: 'feature/314222',
      issueID: 314,
      flowRuleName: 'DEV',
      appID: 378,
      appName: 'flows',
      joinTempBranchStatus: '',
      isJoinTempBranch: false,
      createdAt: '2022-08-02T09:53:43Z',
      updatedAt: '2022-08-02T09:53:43Z',
    },
    hasPermission: true,
    codeNode: {
      currentBranch: 'feature/314222',
      commit: {
        id: '8d94e16d4475d986915b1a2cb5f858bb56e9df82',
        author: null,
        committer: {
          email: 'dice@dice.terminus.io',
          name: 'dice',
          When: '2022-07-08T02:08:26Z',
        },
        commitMessage: 'Update pipeline-yml',
        parentSha: '',
      },
      isJoinTempBranch: false,
      joinTempBranchStatus: '',
      canJoin: true,
      exist: false,
      sourceBranch: 'develop',
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
      currentBranch: 'feature/314222',
      targetBranch: 'master',
      title: 'Automatic merge requests for feature/314222',
      desc: '任务: #314 这是一个很nice的任务',
      mergeRequestInfo: null,
    },
  },
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
      joinTempBranchStatus: 'success',
      isJoinTempBranch: false,
      createdAt: '2022-08-01T08:21:33Z',
      updatedAt: '2022-08-02T07:16:15Z',
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
      joinTempBranchStatus: 'success',
      canJoin: true,
      exist: true,
      sourceBranch: 'develop',
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
      sourceBranch: 'develop',
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
];

export default Workflow;
