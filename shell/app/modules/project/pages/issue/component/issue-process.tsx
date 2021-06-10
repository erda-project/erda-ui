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
import { Progress, Tooltip } from 'app/nusi';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';

interface IProps {
  data: ISSUE.Requirement;
}

const IssueProcess = ({ data }: IProps) => {
  if (!data.issueSummary) {
    return null;
  }
  const { processingCount = 0, doneCount = 0 } = data.issueSummary;
  const sum = processingCount + doneCount;
  if (!sum) {
    return null;
  }
  const jumpToTask = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    goTo(goTo.pages.taskList, {
      projectId: data.projectID,
      query: {
        projectId: data.projectID,
        requirementId: data.id,
        pageNo: 1,
        iterationID: data.iterationID,
        type: ISSUE_TYPE.TASK,
      },
    });
  };
  const percent = Math.round((doneCount / sum) * 10000) / 100;
  return (
    <div className="mt12">
      <div className="flex-box">
        <span>
          {i18n.t('project:task completion')}: {percent}%
        </span>
        <Tooltip title={i18n.t('project:number of completed tasks/total number of tasks')}>
          <span className="hover-active" onClick={jumpToTask}>
            {doneCount}/{sum}
          </span>
        </Tooltip>
      </div>
      <Progress percent={percent} showInfo={false} />
    </div>
  );
};

export default IssueProcess;
