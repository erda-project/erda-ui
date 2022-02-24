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

import { goTo } from 'common/utils';
import { Holder, RadioTabs } from 'common';
import { useLoading } from 'core/stores/loading';
import moment from 'moment';
import { Spin } from 'antd';
import issueStore from 'project/stores/issues';
import { useUserMap } from 'core/stores/userMap';
import React from 'react';
import routeInfoStore from 'core/stores/route';
import i18n from 'app/i18n';
import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';
import UserInfo from 'common/components/user-info';
import userStore from 'user/stores';
import './issue-activities.scss';

interface IProps {
  type: ISSUE_TYPE;
  bottomSlot: React.ReactElement;
}

export const IssueActivities = (props: IProps) => {
  const { type, bottomSlot } = props;
  const userMap = useUserMap();
  const loginUser = userStore.useStore((s) => s.loginUser);
  const { projectId } = routeInfoStore.getState((s) => s.params);

  const issueStreamList: ISSUE.IssueStream[] = issueStore.useStore((s) => s[`${type.toLowerCase()}StreamList`]);
  const [loading] = useLoading(issueStore, ['getIssueStreams']);
  const commentList: Array<Merge<ISSUE.IssueStream, { timestamp: number }>> = [];
  const activityList: ISSUE.IssueStream[] = [];
  const transferList: ISSUE.IssueStream[] = [];
  // const daySplit = {};
  issueStreamList.forEach((item) => {
    // const day = moment(item.updatedAt).format('YYYY/MM/DD');
    // daySplit[day] = daySplit[day] || [];
    // daySplit[day].push(item);
    if (item.streamType === 'Comment') {
      commentList.push({ ...item, timestamp: moment(item.createdAt).valueOf() });
    } else if (['TransferState', 'ChangeAssignee'].includes(item.streamType)) {
      transferList.push(item);
    } else {
      activityList.push(item);
    }
  });
  const tabs = [
    { value: 'comments', label: `${i18n.t('dop:comments')}(${commentList.length})` },
    { value: 'activity', label: `${i18n.t('dop:activity')}(${activityList.length})` },
    { value: 'transfer', label: `${i18n.t('dop:transfer')}(${transferList.length})` },
  ];
  const [tab, setTab] = React.useState(tabs[1].value);

  const commentsRender = () => {
    return commentList
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((comment) => {
        const user = userMap[comment.operator] || {};
        const isSelf = loginUser.id === comment.operator;
        if (isSelf) {
          return (
            <div key={comment.id} className="flex items-start pl-4 mt-4 space-x-1">
              <div className="flex-1 px-4 py-4 rounded-sm my-comment issue-comment-content">{comment.content}</div>
              <UserInfo.RenderWithAvatar id={user.id} />
            </div>
          );
        }
        return (
          <div key={comment.id} className="flex items-start pr-4 mt-4 space-x-1">
            <UserInfo.RenderWithAvatar id={user.id} />
            <div className="flex-1 px-4 py-4 rounded-sm other-comment issue-comment-content">{comment.content}</div>
          </div>
        );
      });
  };

  const activityListRender = (list: ISSUE.IssueStream[]) => {
    return list.map((activity) => {
      const user = userMap[activity.operator] || {};
      const { appID, mrID, mrTitle } = activity.mrInfo as ISSUE.IssueStreamMrInfo;
      return (
        <div key={activity.id} className="relative mt-4 flex issue-activity-item">
          <UserInfo.RenderWithAvatar id={user.id} />
          <div className="flex-1 ml-1 issue-activity-content">
            <div className="flex">
              <span className="ml-1">{user.nick || user.name}</span>
              {activity.streamType === 'RelateMR' ? (
                <>
                  <span className="mx-2">{i18n.t('dop:add relation to MR')}:</span>
                  <a
                    className="text-purple-deep"
                    onClick={() => goTo(goTo.pages.appMr, { projectId, appId: appID, mrId: mrID, jumpOut: true })}
                  >
                    #{mrID} {mrTitle}
                  </a>
                </>
              ) : (
                <span className="mx-2">{activity.content}:</span>
              )}
            </div>
            <div className="text-xs text-sub">{moment(activity.createdAt).format('YYYY/MM/DD HH:mm:ss')}</div>
          </div>
        </div>
      );
    });
  };

  return (
    <Spin spinning={loading}>
      <div className="flex flex-col overflow-auto p-4">
        <RadioTabs value={tab} options={tabs} onChange={(k) => setTab(k)} />
        <div className="overflow-auto">
          <Holder when={!issueStreamList.length && !loading}>
            <div className={tab === tabs[0].value ? '' : 'hidden'}>{commentsRender()}</div>
            <div className={tab === tabs[1].value ? '' : 'hidden'}>{activityListRender(activityList)}</div>
            <div className={tab === tabs[2].value ? '' : 'hidden'}>{activityListRender(transferList)}</div>
          </Holder>
        </div>
      </div>
      {bottomSlot}
    </Spin>
  );
};
