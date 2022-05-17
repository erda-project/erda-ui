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
import { DevFlowInfos } from 'project/services/project-workflow';
import Steps, { StepCode, StepPipeline, StepTempMerge } from './steps';
import { getJoinedApps } from 'user/services/user';

export interface IProps {
  scope: 'ISSUE' | 'MR';
  projectID: number;
  flowInfo: DevFlowInfos;
  getFlowNodeList: () => void;
}

const Workflow: React.FC<IProps> = ({ scope, projectID, getFlowNodeList, flowInfo }) => {
  const [apps, setApps] = React.useState<IApplication[]>([]);
  const { devFlowInfos } = flowInfo ?? {};
  const hasNode = !!devFlowInfos?.length;
  React.useEffect(() => {
    if (hasNode && scope === 'ISSUE') {
      getJoinedApps({
        pageSize: 200,
        pageNo: 1,
        projectId: projectID,
      }).then((res) => {
        setApps(res?.data?.list ?? []);
      });
    }
  }, [hasNode, scope]);
  return (
    <>
      {devFlowInfos?.map((item) => {
        const { devFlowNode } = item;
        const currentApp = apps.find((app) => devFlowNode.appID === app.id)!;
        return (
          <Steps key={devFlowNode.mergeID}>
            {scope === 'ISSUE' ? <StepCode data={item} app={currentApp} beta /> : null}
            <StepTempMerge
              projectID={projectID}
              data={item}
              afterChangeStatus={() => {
                getFlowNodeList();
              }}
              afterRebuild={() => {
                getFlowNodeList();
              }}
              beta
            />
            <StepPipeline data={item} projectID={projectID} beta />
          </Steps>
        );
      })}
    </>
  );
};

export default Workflow;
