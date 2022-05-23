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
import { DevFlowInfo, DevFlowInfos, getPipelineDetail, PipelineInfo } from 'project/services/project-workflow';
import { Popover } from 'antd';
import Steps, { CodeSimple, SimplePipeline, StepCode, StepPipeline, StepTempMerge, TempMergeSimple } from './steps';
import i18n from 'i18n';
import { ciNodeStatusSet } from 'application/pages/pipeline/run-detail/config';
import { produce } from 'immer';

export interface IProps {
  scope: 'ISSUE' | 'MR';
  projectID: number;
  flowInfo: DevFlowInfos;
  getFlowNodeList: () => void;
}

interface IPipelineInfo extends PipelineInfo {
  taskCount?: {
    taskTotal?: number;
    finishTaskTotal?: number;
  };
}

const WorkflowItem: React.FC<
  {
    data: DevFlowInfo;
  } & Omit<IProps, 'flowInfo'>
> = ({ data, scope, getFlowNodeList, projectID }) => {
  const { pipelineStepInfos } = data;
  const [pipelineInfo, setPipelineInfo] = React.useState<IPipelineInfo[]>(pipelineStepInfos);

  React.useEffect(() => {
    setPipelineInfo(pipelineStepInfos);
    const queryQueue = (pipelineStepInfos ?? [])
      .filter((item) => !!item.pipelineID)
      .map((item) => getPipelineDetail({ pipelineID: item.pipelineID }).then((res) => res.data));
    Promise.all(queryQueue ?? []).then((pipelineDetails) => {
      const taskMap = {};
      pipelineDetails.forEach((pipelineDetail) => {
        if (pipelineDetail) {
          const { pipelineStages } = pipelineDetail;
          const taskTotal = pipelineStages.reduce((prev, curr) => prev + curr.pipelineTasks?.length ?? 0, 0);
          const finishTaskTotal = pipelineStages.reduce(
            (prev, curr) =>
              prev + curr.pipelineTasks?.filter((t) => ciNodeStatusSet.taskFinalStatus.includes(t.status)).length,
            0,
          );
          taskMap[pipelineDetail.id] = {
            finishTaskTotal,
            taskTotal,
          };
        }
      });
      const newInfo = produce(pipelineStepInfos ?? [], (draft) =>
        draft.map((item) => {
          return {
            ...item,
            taskCount: taskMap[item.pipelineID],
          };
        }),
      );
      setPipelineInfo(newInfo);
    });
  }, [pipelineStepInfos]);
  return (
    <>
      <Popover
        getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
        content={
          <div className="flex">
            {scope === 'ISSUE' ? <StepCode data={data} /> : null}
            <StepTempMerge
              projectID={projectID}
              data={data}
              afterChangeStatus={() => {
                getFlowNodeList();
              }}
              afterRebuild={() => {
                getFlowNodeList();
              }}
            />
            <StepPipeline pipelineInfo={pipelineInfo} data={data} projectID={projectID} />
          </div>
        }
      >
        <div>
          <Steps>
            {scope === 'ISSUE' ? <CodeSimple data={data} /> : null}
            <TempMergeSimple data={data} projectID={projectID} />
            <SimplePipeline data={data} pipelineInfo={pipelineInfo} projectID={projectID} />
          </Steps>
        </div>
      </Popover>
    </>
  );
};

const Workflow: React.FC<IProps> = ({ scope, projectID, getFlowNodeList, flowInfo }) => {
  const { devFlowInfos } = flowInfo ?? {};
  return (
    <>
      {devFlowInfos?.map((item) => {
        const { hasPermission } = item;
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
        return <WorkflowItem data={item} scope={scope} projectID={projectID} getFlowNodeList={getFlowNodeList} />;
      })}
    </>
  );
};

export default Workflow;
