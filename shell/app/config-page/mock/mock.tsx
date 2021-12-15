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
import DiceConfigPage, { useMock } from 'app/config-page';
import { Tooltip, Avatar } from 'antd';
import { ISSUE_PRIORITY_MAP } from 'project/common/components/issue/issue-config';
import { getAvatarChars } from 'app/common/utils';
import { Badge, ErdaIcon } from 'common';
import { IssueIcon } from 'project/common/components/issue/issue-icon';
import { ossImg } from 'common/utils';
import { useUserMap } from 'core/stores/userMap';

const CardRender = (props: { data: Obj }) => {
  const titleMaxLength = 36;
  const userMap = useUserMap();
  const { data } = props || {};
  const { title, extra, userID } = data || {};
  const { type, status, priority } = extra || {};
  const assigneeObj = userMap[userID] || {};
  const isTitleExceeds = typeof title === 'string' && title.length > titleMaxLength;
  return (
    <>
      <div className={'flex justify-between items-start mb-1'}>
        <Tooltip
          destroyTooltipOnHide
          title={isTitleExceeds ? title : ''}
          className="flex-1 text-sm text-default break-word w-64"
        >
          {isTitleExceeds ? `${title.slice(0, titleMaxLength)}...` : title}
        </Tooltip>
      </div>

      <div className="cp-kanban-info mt-1 flex flex-col text-desc">
        <div className="flex justify-between items-center mt-1">
          <div className="flex justify-between items-center">
            <span className="flex items-center mr-2">
              <IssueIcon type={type} size="16px" />
            </span>
            {status && Object.keys(status).length > 0 && (
              <Badge status={status.status} text={status.text} showDot={false} className="mr-2" />
            )}
            <span className="w-20 mr-1">
              {priority && (
                <span className="flex items-center">
                  <IssueIcon type={priority} iconMap="PRIORITY" size="16px" />
                  <span className="ml-1">{ISSUE_PRIORITY_MAP[priority].label}</span>
                </span>
              )}
            </span>
          </div>
          {Object.keys(assigneeObj).length > 0 ? (
            <span>
              <Avatar src={assigneeObj.avatar ? ossImg(assigneeObj.avatar, { w: 24 }) : undefined} size={24}>
                {getAvatarChars(assigneeObj.nick || assigneeObj.name)}
              </Avatar>
            </span>
          ) : (
            <ErdaIcon size={24} type="morentouxiang" />
          )}
        </div>
      </div>
    </>
  );
};

const Mock = () => {
  return (
    <DiceConfigPage
      showLoading
      scenarioType="mock"
      scenarioKey={'mock'}
      useMock={useMock}
      forceMock
      customProps={{
        issueKanbanV2: {
          props: {
            CardRender,
          },
        },
      }}
    />
  );
};
export default Mock;
