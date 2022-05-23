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
import Workflow from 'project/common/components/workflow';
import AddFlow from 'project/common/components/workflow/steps/add-flow';
import { getFlowList, WorkflowHint } from 'project/services/project-workflow';
import { getProjectIterations } from 'project/services/project-iteration';

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
  React.useEffect(() => {
    getFlowNodeList();
  }, [getFlowNodeList]);
  return (
    <div>
      <div className="relative h-12 flex-h-center text-primary font-medium">
        <span className="text-base relative pr-8">
          {i18n.t('dop:workflow')}
          <span className="absolute px-2 rounded-full text-xs text-purple border border-purple border-solid absolute -top-2">
            beta
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
      {devFlowInfos ? (
        <Workflow flowInfo={devFlowInfos} scope="ISSUE" projectID={projectID} getFlowNodeList={getFlowNodeList} />
      ) : null}
    </div>
  );
};

export default IssueWorkflow;
