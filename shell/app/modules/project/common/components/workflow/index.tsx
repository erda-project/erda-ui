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
import i18n from 'i18n';

export interface IProps {
  scope: 'ISSUE' | 'MR';
  projectID: number;
  flowInfo: DevFlowInfos;
  getFlowNodeList: () => void;
}

const Workflow: React.FC<IProps> = ({ scope, projectID, getFlowNodeList, flowInfo }) => {
  const { devFlowInfos } = flowInfo ?? {};
  return (
    <>
      {devFlowInfos?.map((item) => {
        const { devFlowNode, hasPermission } = item;
        if (!hasPermission) {
          return (
            <Steps>
              <div className="text-center flex-1 text-sub">
                {i18n.t(
                  'dop:No permission to access the current application {name}, Contact the application administrator to add permission',
                  { name: item.devFlowNode.appName },
                )}
              </div>
            </Steps>
          );
        }
        return (
          <Steps key={devFlowNode.mergeID}>
            {scope === 'ISSUE' ? <StepCode data={item} /> : null}
            <StepTempMerge
              projectID={projectID}
              data={item}
              afterChangeStatus={() => {
                getFlowNodeList();
              }}
              afterRebuild={() => {
                getFlowNodeList();
              }}
            />
            <StepPipeline data={item} projectID={projectID} />
          </Steps>
        );
      })}
    </>
  );
};

export default Workflow;
