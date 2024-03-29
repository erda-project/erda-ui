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
import { Popconfirm } from 'antd';
import CodeCard from './cards/code';
import MergeCard from './cards/merge';
import PipelineCard from './cards/pipeline';
import MergeRequestCard from './cards/merge-request';
import { deleteFlow } from 'project/services/project-workflow';

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
              <div>
                <ErdaIcon
                  onClick={() => {
                    getFlowNodeList();
                  }}
                  size={18}
                  type="shuaxin"
                  className=" font-medium cursor-pointer text-default-6 hover:text-default-8"
                />

                <Popconfirm
                  title={`${i18n.t('common:confirm to delete')}?`}
                  onConfirm={() => {
                    deleteFlow({ flowId: devFlow.id, deleteBranch: true }).then(() => {
                      getFlowNodeList();
                    });
                  }}
                >
                  <ErdaIcon
                    size={18}
                    type="shanchu"
                    className=" font-medium cursor-pointer ml-2 text-default-6 hover:text-default-8"
                  />
                </Popconfirm>
              </div>
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

export default Workflow;
