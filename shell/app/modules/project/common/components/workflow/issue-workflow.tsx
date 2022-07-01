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
import AddFlow from 'project/common/components/workflow/add-flow';
import { getFlowList, getBranchPolicy } from 'project/services/project-workflow';
import { getProjectIterations } from 'project/services/project-iteration';
import { FlowType } from 'project/common/config';
import { goTo } from 'app/common/utils';

interface IProps {
  projectID: number;
  id: number;
  metaIssue: Obj;
}

const IssueWorkflow: React.FC<IProps> = ({ projectID, id, metaIssue }) => {
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

  const [workflows] = getBranchPolicy.useState();

  const getWorkflows = React.useCallback(() => getBranchPolicy.fetch({ projectID }), [projectID]);

  React.useEffect(() => {
    getWorkflows();
  }, [getWorkflows]);

  React.useEffect(() => {
    getFlowNodeList();
  }, [getFlowNodeList]);
  const hasMultipleBranch =
    workflows?.flows &&
    workflows.flows.filter((item) => {
      const curBranchType = (workflows?.branchPolicies || []).find(
        (bItem) => bItem.branch === item.targetBranch,
      )?.branchType;
      return curBranchType !== FlowType.SINGLE_BRANCH;
    }).length;
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
        <div className="py-4 px-8">
          <span className=" text-default-6">{i18n.s('No workflow has been added yet, please click + Add', 'dop')}</span>
        </div>
      ) : (
        <div className="py-4 px-8  text-default-6">
          <div>
            {i18n.s(
              'There is no multi-branch configuration for R&D workflow, and workflow display is not currently supported.',
              'dop',
            )}
          </div>
          <div>
            <span>{i18n.s('Please contact the project administrator, go to', 'dop')}</span> &nbsp;
            <span
              className="text-purple-deep cursor-pointer"
              onClick={() => {
                goTo(goTo.pages.projectSetting, { jumpOut: true, query: { tabKey: 'workflow' } });
              }}
            >
              {i18n.t('dop:R&D Workflow')}
            </span>
            &nbsp;
            <span>{i18n.s('to set', 'dop')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueWorkflow;
