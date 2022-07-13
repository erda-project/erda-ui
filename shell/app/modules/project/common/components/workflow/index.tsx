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
  } & Omit<IProps, 'flowInfo'>
> = ({ data, scope, getFlowNodeList, projectID }) => {
  const code = ({ index, className }: { index: number; className?: string }) => (
    <CodeCard index={index} data={data} projectID={`${projectID}`} className={className} reload={getFlowNodeList} />
  );
  const merge = ({ index, className }: { index: number; className?: string }) => (
    <MergeCard index={index} data={data} projectID={`${projectID}`} className={className} reload={getFlowNodeList} />
  );
  const pipeline = ({ index, className }: { index: number; className?: string }) => (
    <PipelineCard index={index} data={data} projectID={`${projectID}`} className={className} />
  );

  const mr = ({ index, className }: { index: number; className?: string }) => (
    <MergeRequestCard index={index} data={data} projectID={`${projectID}`} className={className} />
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
      {devFlowInfos?.map((item, idx) => {
        const { hasPermission, devFlowRuleName = '' } = item;
        const appName = item.devFlowNode?.appName || '';

        return (
          <div key={idx} className="border-all rounded mb-2">
            <div className="px-4 py-2 flex-h-center border-bottom bg-default-02 justify-between ">
              <div className="flex-h-center">
                <ErdaIcon size={16} className="text-default-4" type="yingyongmingcheng" />
                <span className="ml-2 font-medium text-default">
                  {appName} {` (${i18n.t('dop:workflow')} - ${devFlowRuleName}) `}
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
                    { name: item.devFlowNode.appName },
                  )}
                </div>
              ) : (
                <WorkflowItem data={item} scope={scope} projectID={projectID} getFlowNodeList={getFlowNodeList} />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Workflow;
