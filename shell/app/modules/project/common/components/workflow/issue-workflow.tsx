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
import i18n from 'i18n';
import { ErdaIcon } from 'common';
import Workflow from 'project/common/components/workflow';
import AddFlow from 'project/common/components/workflow/steps/add-flow';
import { getFlowList, WorkflowHint, queryWorkflow } from 'project/services/project-workflow';
import { getProjectIterations } from 'project/services/project-iteration';
import { FlowType } from 'project/common/config';

interface IProps {
  projectID: number;
  id: number;
  type: WorkflowHint['place'];
  metaIssue: Obj;
}

const IssueWorkflow: React.FC<IProps> = ({ projectID, id, type, metaIssue }) => {
  const devFlowInfos = getFlowList.useData();
  const [currentIteration, setIteration] = React.useState<ITERATION.Detail>({} as any);
  const { iterationID } = metaIssue;
  const [expand, setExpand] = React.useState(true);
  const getFlowNodeList = React.useCallback(() => {
    getFlowList.fetch({
      issueID: id,
      projectID,
    });
  }, [projectID, id]);
  React.useEffect(() => {
    getProjectIterations({
      projectID,
      pageSize: 100,
      pageNo: 1,
    }).then((res) => {
      const iteration = res?.data?.list.find((t) => t.id === iterationID)!;
      setIteration(iteration);
    });
  }, []);

  const [workflows] = queryWorkflow.useState();

  const getWorkflows = React.useCallback(() => queryWorkflow.fetch({ projectID }), [projectID]);

  React.useEffect(() => {
    getWorkflows();
  }, [getWorkflows]);

  React.useEffect(() => {
    getFlowNodeList();
  }, [getFlowNodeList]);
  const hasMultipleBranch =
    workflows?.flows && workflows.flows.filter((item) => item.flowType !== FlowType.SINGLE_BRANCH).length;
  return (
    <div>
      <div className="relative h-12 flex-h-center text-primary font-medium">
        <span
          className="section-operate-title flex-h-center cursor-pointer hover:text-default"
          onClick={() => setExpand(!expand)}
        >
          <If condition={!!devFlowInfos?.devFlowInfos.length}>
            <span className="absolute left-[-20px] flex rounded-sm text-sub op-icon">
              <ErdaIcon size={20} type={`${expand ? 'down-4ffff0f4' : 'right-4ffff0i4'}`} />
            </span>
          </If>
          <span className="text-base relative">
            {i18n.t('dop:workflow')} ({devFlowInfos?.devFlowInfos.length || 0})
          </span>
        </span>

        <span className="w-px h-3 bg-default-1 mx-4" />
        <AddFlow
          onAdd={getFlowNodeList}
          type={type}
          metaData={{
            iteration: currentIteration,
            issue: metaIssue,
          }}
        />
      </div>
      {devFlowInfos?.devFlowInfos.length ? (
        <If condition={expand}>
          <Workflow flowInfo={devFlowInfos} scope="ISSUE" projectID={projectID} getFlowNodeList={getFlowNodeList} />
        </If>
      ) : hasMultipleBranch ? (
        <div>
          <div>{'暂无开启工作流，请点击 + 启动工作流'}</div>
        </div>
      ) : (
        <div>
          <div>{'项目研发规范中开发分支为单分支配置，暂不支持工作流显示'}</div>
          <div>
            <span>{'请联系项目管理员，在'}</span>
            <span>{'项目设置的研发工作流'}</span>
            <span>{'进行配置'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueWorkflow;
