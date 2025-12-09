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
import { getFlowList } from 'project/services/project-workflow';
import { goTo } from 'app/common/utils';
import { TASK_FLOW } from './config';

interface IProps {
  projectID: number;
  id: number;
  type: string;
}

const IssueWorkflow: React.FC<IProps> = ({ projectID, id }) => {
  const devFlowInfos = getFlowList.useData();
  const [flowUseable, setFlowUseable] = React.useState(false);
  const [expand, setExpand] = React.useState(true);
  const getFlowNodeList = React.useCallback(() => {
    getFlowList.fetch({
      issueID: id,
      projectID,
    });
  }, [projectID, id]);

  React.useEffect(() => {
    getFlowNodeList();
  }, [getFlowNodeList]);

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
        <AddFlow onAdd={getFlowNodeList} projectID={projectID} onFlowUseable={setFlowUseable} issueId={id} />
      </div>
      {devFlowInfos?.devFlowInfos.length ? (
        <If condition={expand}>
          <Workflow flowInfo={devFlowInfos} scope="ISSUE" projectID={projectID} getFlowNodeList={getFlowNodeList} />
        </If>
      ) : flowUseable ? (
        <div className="py-4 px-8">
          <span className=" text-default-6">{i18n.t('dop:No workflow has been added yet, please click + Add')}</span>
        </div>
      ) : (
        <div className="py-4 px-8  text-default-6">
          <span>{i18n.t('dop:Workflow {name} not exist', { name: TASK_FLOW })}</span>
          <span>
            <span>{i18n.t('dop:Please contact the project administrator, go to')}</span> &nbsp;
            <span
              className="text-blue-deep cursor-pointer"
              onClick={() => {
                goTo(goTo.pages.projectSetting, { jumpOut: true, query: { tabKey: 'workflow' } });
              }}
            >
              {i18n.t('dop:R&D Workflow')}
            </span>
            &nbsp;
            <span>{i18n.t('dop:to set')}</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default IssueWorkflow;
