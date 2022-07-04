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
import { ErdaIcon, Ellipsis, Badge, MarkdownRender } from 'common';
import i18n from 'i18n';
import { ciStatusMap } from 'project/common/components/pipeline-new/config';
import { Popover, Tooltip } from 'antd';
import { goTo } from 'common/utils';
import { Status } from './base';
import { decode } from 'js-base64';

interface CardProps {
  data: DEVOPS_WORKFLOW.DevFlowInfo;
  className?: string;
  index: number;
  projectID: string;
  reload?: () => void;
}

const PipelineCard = (props: CardProps) => {
  const { data, projectID, className, index } = props;
  const { pipelineStepInfos, devFlowNode, inode, hasOnPushBranch } = data;
  const { commit, tempBranch } = data.devFlowNode || {};

  const getStepStatus = () => {
    const colorMap = {
      red: 'error',
      blue: 'process',
      green: 'success',
      orange: 'warnning',
      gray: 'process',
    };
    return pipelineStepInfos?.[0]?.status
      ? colorMap[ciStatusMap[pipelineStepInfos?.[0]?.status]?.color || 'process']
      : 'process';
  };
  const stepStatus = data.changeBranch?.find((item) => item.commit.id === commit?.id) ? getStepStatus() : 'wait';

  const pipeline = pipelineStepInfos[0];

  const genGuideCode = `
  \`\`\`yml
  on:
    push:
      branches:
        - ${tempBranch}
  \`\`\`
  `;

  const { status, text } = ciStatusMap[pipeline?.status || 'Initializing'];

  let subContent: JSX.Element | null = null;
  if (!tempBranch) {
    subContent = (
      <div className="text-xs text-default-8">
        {i18n.s('The temporary merge is not enabled, and there is no pipeline', 'dop')}
      </div>
    );
  } else if (!inode) {
    subContent = (
      <div className="text-xs text-default-8">
        {i18n.s('There is no pipeline for the temporary branch, please contact the administrator to create', 'dop')}
      </div>
    );
  } else if (!hasOnPushBranch) {
    const pipelineName = decode(inode).split('/').pop();
    subContent = (
      <>
        <div
          className="flex-h-center text-xs group cursor-pointer"
          onClick={() => {
            goTo(goTo.pages.pipelineRoot, {
              jumpOut: true,
              projectId: projectID,
              appId: devFlowNode.appID,
              query: { nodeId: inode },
            });
          }}
        >
          <ErdaIcon type="liushuixian-5i55l85f" className="mr-1 text-default-4 group-hover:text-purple-deep" />
          <Ellipsis className="text-default-8 group-hover:text-purple-deep" title={pipelineName} />
        </div>
        <div className="text-xs mt-2 text-default-8">
          <span>{i18n.s('The pipeline is not configured with triggers yet.', 'dop')}</span>
          <Popover
            content={
              <div>
                <p className="pb-2 mb-2 border-0 border-b border-b-default-1 border-solid">
                  <Ellipsis title={i18n.t('dop:Add the following configuration to the pipeline file')} />
                </p>
                <MarkdownRender className="p-0" value={genGuideCode} />
              </div>
            }
          >
            <span className="text-purple-deep cursor-pointer">{i18n.s('How to configure?', 'dop')}</span>
          </Popover>
        </div>
      </>
    );
  } else if (pipeline) {
    subContent = (
      <>
        <div
          className="flex-h-center text-xs group cursor-pointer"
          onClick={() => {
            goTo(goTo.pages.pipelineRoot, {
              jumpOut: true,
              projectId: projectID,
              appId: devFlowNode.appID,
              query: { pipelineID: pipeline.pipelineID },
            });
          }}
        >
          <ErdaIcon type="liushuixian-5i55l85f" className="mr-1 text-default-4 group-hover:text-purple-deep" />
          <Ellipsis className="text-default-8 group-hover:text-purple-deep" title={pipeline.ymlName} />
        </div>
        <div>
          <Badge status={status} text={text} onlyText size={'small'} />
        </div>
      </>
    );
  }

  return (
    <div className={`hover:shadow flex w-[320px] h-[108px] border-all p-4 rounded ${className}`}>
      <Status status={stepStatus} index={index} />
      <div className="ml-2 flex-1 overflow-hidden">
        <div className="mb-3 flex-h-center">
          <span>{i18n.t('Pipeline')}</span>
          <Tooltip
            title={i18n.s(
              'This is a temporary merge pipeline. If you need to modify it, please contact the application administrator',
              'dop',
            )}
          >
            <ErdaIcon type="help" className="text-default-3 ml-1" />
          </Tooltip>
        </div>
        {subContent}
      </div>
    </div>
  );
};

export default PipelineCard;
