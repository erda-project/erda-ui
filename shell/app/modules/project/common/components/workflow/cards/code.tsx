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
import { ErdaIcon, Ellipsis } from 'common';
import i18n from 'i18n';
import { Tooltip } from 'antd';
import { tempMerge } from 'project/services/project-workflow';
import { Commit, Branch, Status } from './base';
import classnames from 'classnames';

interface CardProps {
  data: DEVOPS_WORKFLOW.DevFlowInfo;
  className?: string;
  index: number;
  projectID: string;
  reload?: () => void;
}
const CodeCard = (props: CardProps) => {
  const { data, projectID, reload, index, className } = props;
  const { canJoin, commit, sourceBranch, appID, mergeID, tempBranch } = data.devFlowNode || {};
  return (
    <div className={classnames(className, 'hover:shadow flex w-[320px] h-[108px] border-all p-4 rounded')}>
      <Status status="success" index={index} />
      <div className="ml-2 flex-1 overflow-hidden">
        <div className="mb-3 flex-h-center justify-between">
          <div className="flex-h-center">
            <span>{i18n.t('dop:Code')}</span>
            <Tooltip title={i18n.s('All development code of this task is managed in this branch', 'dop')}>
              <ErdaIcon type="help" className="text-default-3 ml-1" />
            </Tooltip>
          </div>
          <Tooltip
            title={!tempBranch ? i18n.s('The temporary merge is not enabled, please set it before merging', 'dop') : ''}
          >
            <div
              onClick={() => {
                tempBranch &&
                  canJoin &&
                  tempMerge({ mergeId: mergeID, enable: true }).then(() => {
                    reload?.();
                  });
              }}
              className={`px-3 rounded cursor-pointer ${
                canJoin && tempBranch ? ' bg-purple-deep text-white' : 'bg-default-08 text-default-4'
              }`}
            >
              {canJoin ? i18n.s('Merge into temporary branch', 'dop') : i18n.s('Merged into temporary branch', 'dop')}
            </div>
          </Tooltip>
        </div>
        <Branch className="mb-2" appId={appID} projectId={projectID} branch={sourceBranch} />
        <div className="flex-h-center text-xs">
          {commit ? (
            <>
              <Commit commitId={commit.id} appId={appID} projectId={projectID} />
              <ErdaIcon type="caret-down" size="12" className="ml-1 text-default-4 -rotate-90" />
              <Ellipsis className="flex-1 text-default-8" title={commit.commitMessage} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CodeCard;
