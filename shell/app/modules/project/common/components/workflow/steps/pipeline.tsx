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
import { Ellipsis, ErdaIcon, MarkdownRender } from 'common';
import { Badge, Popover } from 'antd';
import { goTo } from 'common/utils';
import { produce } from 'immer';
import { ciNodeStatusSet, ciStatusMap } from 'application/pages/pipeline/run-detail/config';
import { DevFlowInfo, getPipelineDetail, PipelineInfo } from 'project/services/project-workflow';
import BaseStep, { IBaseProps } from './base-step';
import i18n from 'i18n';

interface IProps extends IBaseProps {
  data: DevFlowInfo;
  projectID: number;
}

interface IPipelineInfo extends PipelineInfo {
  taskCount?: {
    taskTotal?: number;
    finishTaskTotal?: number;
  };
}

const genGuideCode = (branch: string) => {
  return `
\`\`\`yml
on:
  push:
    branches:
      - ${branch}
\`\`\`
`;
};

const Pipeline: React.FC<IProps> = ({ data, projectID }) => {
  const { pipelineStepInfos, devFlowNode } = data;
  const [pipelineInfo, setPipelineInfo] = React.useState<IPipelineInfo[]>(pipelineStepInfos);

  React.useEffect(() => {
    setPipelineInfo(pipelineStepInfos);
    const queryQueue = (pipelineStepInfos ?? []).map((item) =>
      getPipelineDetail({ pipelineID: item.pipelineID }).then((res) => res.data),
    );
    Promise.all(queryQueue ?? []).then((pipelineDetails) => {
      const takMap = {};
      pipelineDetails.forEach((pipelineDetail) => {
        if (pipelineDetail) {
          const { pipelineStages } = pipelineDetail;
          const taskTotal = pipelineStages.reduce((prev, curr) => prev + curr.pipelineTasks?.length ?? 0, 0);
          const finishTaskTotal = pipelineStages.reduce(
            (prev, curr) =>
              prev + curr.pipelineTasks?.filter((t) => ciNodeStatusSet.taskFinalStatus.includes(t.status)).length,
            0,
          );
          takMap[pipelineDetail.id] = {
            finishTaskTotal,
            taskTotal,
          };
        }
      });
      const newInfo = produce(pipelineStepInfos ?? [], (draft) =>
        draft.map((item) => {
          return {
            ...item,
            taskCount: takMap[item.pipelineID],
          };
        }),
      );
      setPipelineInfo(newInfo);
    });
  }, [pipelineStepInfos]);
  const url = goTo.resolve.pipelineRoot({
    projectId: projectID,
    appId: devFlowNode.appID,
  });
  return (
    <BaseStep title={i18n.t('dop:{type} node', { type: i18n.t('Pipeline') })}>
      <div className="workflow-step-pipeline">
        {pipelineInfo?.length ? (
          pipelineInfo.map((item) => {
            const { status, text } = ciStatusMap[item.status];
            return (
              <div key={item.pipelineID} className="flex justify-between items-center">
                <div className="flex justify-start items-center flex-1 max-w-[200px]">
                  <Popover content={text}>
                    <Badge status={status} />
                  </Popover>
                  <Ellipsis title={item.ymlName} />
                </div>
                <div className="flex justify-start items-center">
                  {item.taskCount ? (
                    <span>
                      [{item.taskCount.finishTaskTotal}/{item.taskCount.taskTotal}]
                    </span>
                  ) : null}
                  <a className="flex items-center ml-2" href={`${url}?pipelineID=${item.pipelineID}`} target="_blank">
                    <ErdaIcon className="hover:text-purple-deep" type="share" />
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div>
            <p className="pb-2 mb-2 border-0 border-b border-b-default-1 border-solid">
              <Ellipsis title={i18n.t('dop:Add the following configuration to the pipeline file')} />
            </p>
            <MarkdownRender className="p-0" value={genGuideCode(data.devFlowNode.sourceBranch)} />
          </div>
        )}
      </div>
    </BaseStep>
  );
};

export default Pipeline;
