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
import { Ellipsis, MarkdownRender } from 'common';
import { Badge, Popover } from 'antd';
import { goTo } from 'common/utils';
import { ciStatusMap } from 'project/common/components/pipeline-new/config';
import { DevFlowInfo, PipelineInfo } from 'project/services/project-workflow';
import BaseStep, { BaseStepSimple, IBaseProps } from './base-step';
import i18n from 'i18n';

interface IProps extends IBaseProps {
  data: DevFlowInfo;
  projectID: number;
  pipelineInfo: IPipelineInfo[];
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
const PipeLineList = ({ pipelineInfo, url }: { pipelineInfo: IPipelineInfo[]; url?: string }) => {
  return (
    <>
      {pipelineInfo.map((item) => {
        const { status, text } = ciStatusMap[item.status || 'Initializing'];
        return (
          <div key={item.pipelineID} className="flex justify-between items-center">
            <div className="flex justify-start items-center flex-1 max-w-[200px]">
              <Popover content={text}>
                <Badge status={status} />
              </Popover>
              {item.pipelineID && url ? (
                <a
                  className="truncate hover:text-purple-deep"
                  target="_blank"
                  href={`${url}?pipelineID=${item.pipelineID}`}
                >
                  {item.ymlName}
                </a>
              ) : (
                <Ellipsis title={item.ymlName} />
              )}
            </div>
            <div className="flex justify-start items-center">
              {item.taskCount ? (
                <span>
                  [{item.taskCount.finishTaskTotal}/{item.taskCount.taskTotal}]
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </>
  );
};

const Pipeline: React.FC<IProps> = ({ data, projectID, pipelineInfo }) => {
  const { devFlowNode } = data;

  const url = goTo.resolve.pipelineRoot({
    projectId: projectID,
    appId: devFlowNode.appID,
  });
  return (
    <BaseStep title={i18n.t('dop:{type} node', { type: i18n.t('Pipeline') })}>
      <div className="workflow-step-pipeline">
        {pipelineInfo?.length ? (
          <PipeLineList pipelineInfo={pipelineInfo} url={url} />
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

export const SimplePipeline: React.FC<IProps> = ({ pipelineInfo, projectID, data }) => {
  const { devFlowNode } = data;
  const url = goTo.resolve.pipelineRoot({
    projectId: projectID,
    appId: devFlowNode.appID,
  });
  const list = pipelineInfo.slice(0, 1);
  return (
    <BaseStepSimple icon="pipeline">
      {list.length ? (
        <PipeLineList pipelineInfo={pipelineInfo.slice(0, 1)} url={url} />
      ) : (
        <span>{i18n.t('common:No data')}</span>
      )}
    </BaseStepSimple>
  );
};

export default Pipeline;
