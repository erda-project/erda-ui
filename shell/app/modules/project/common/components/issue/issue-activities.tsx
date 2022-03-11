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
import { ErdaIcon, Holder, MarkdownRender, SimpleTabs } from 'common';
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
import { on, off } from 'core/event-hub';
import './issue-activities.scss';

interface IProps {
  type: ISSUE_TYPE;
}

export const IssueActivities = (props: IProps) => {
  const { type } = props;
  const userMap = useUserMap();
  const { projectId } = routeInfoStore.getState((s) => s.params);
  const [openMap, setOpenMap] = React.useState<Obj<boolean>>({});
  const listDomRef = React.useRef<HTMLDivElement>(null);

  const issueStreamList: ISSUE.IssueStream[] = issueStore.useStore((s) => s[`${type.toLowerCase()}StreamList`]);
  const [loading] = useLoading(issueStore, ['getIssueStreams']);
  const commentList: Array<Merge<ISSUE.IssueStream, { timestamp: number }>> = [];
  const activityList: ISSUE.IssueStream[] = [];
  const transferList: ISSUE.IssueStream[] = [];
  issueStreamList.forEach((item) => {
    if (item.streamType === 'Comment') {
      commentList.push({ ...item, timestamp: moment(item.createdAt).valueOf() });
    } else if (['TransferState', 'ChangeAssignee', 'ChangeOwner'].includes(item.streamType)) {
      transferList.push(item);
    } else {
      activityList.push(item);
    }
  });
  const tabs = [
    { key: 'all', text: `${i18n.t('dop:all')}(${issueStreamList.length})`, data: issueStreamList },
    { key: 'comments', text: `${i18n.t('dop:comments')}(${commentList.length})`, data: commentList },
    { key: 'activity', text: `${i18n.t('dop:activity')}(${activityList.length})`, data: activityList },
    { key: 'transfer', text: `${i18n.t('dop:transfer')}(${transferList.length})`, data: transferList },
  ];
  const [activeTabKey, setActiveTabKey] = React.useState(tabs[0].key);
  React.useEffect(() => {
    const listener = on('issue:scrollToLatestComment', () => {
      setActiveTabKey('comments');
      if (listDomRef.current) {
        listDomRef.current.scrollIntoView();
      }
    });
    return () => off('issue:scrollToLatestComment', listener);
  }, []);

  const activityListRender = (list: ISSUE.IssueStream[]) => {
    return list.map((activity) => {
      const user = userMap[activity.operator] || {};
      const { appID, mrID, mrTitle } = activity.mrInfo as ISSUE.IssueStreamMrInfo;
      if (activity.streamType === 'Comment') {
        return (
          <div key={activity.id} className="relative mt-4 flex issue-activity-item items-start">
            <UserInfo.RenderWithAvatar
              avatarSize="default"
              id={user.id}
              showName={false}
              className="absolute left-[-12px]"
            />
            <div className="flex-1 ml-5 p-4 rounded-sm issue-activity-content issue-comment-content">
              <div>
                <MarkdownRender value={activity.content} />
              </div>
              <div className="flex items-center mt-2 text-xs text-sub space-x-6">
                <span>{user.nick || user.name}</span>
                <span className="inline-flex items-center">
                  <ErdaIcon type="shijian-2" className="mr-1" size={16} />
                  <span>{moment(activity.createdAt).format('YYYY/MM/DD HH:mm:ss')}</span>
                </span>
              </div>
            </div>
          </div>
        );
      }
      const simpleContent = {
        ChangeTitle: i18n.t('dop:Updated the title'),
        ChangeManHour: i18n.t('dop:Updated the working hours'),
      };
      return (
        <div key={activity.id} className="relative mt-4 flex issue-activity-item items-start">
          <div className="flex-1 ml-4 issue-activity-content">
            <div className="flex items-center space-x-2">
              <span>{user.nick || user.name}</span>
              {activity.streamType === 'RelateMR' ? (
                <>
                  <span className="text-default">{i18n.t('dop:add relation to MR')}</span>
                  <a
                    className="text-purple-deep"
                    onClick={() => goTo(goTo.pages.appMr, { projectId, appId: appID, mrId: mrID, jumpOut: true })}
                  >
                    #{mrID} {mrTitle}
                  </a>
                </>
              ) : (
                <span className="text-default">{simpleContent[activity.streamType] || activity.content}</span>
              )}
              <span className="ml-2 text-xs text-sub">{moment(activity.createdAt).format('YYYY/MM/DD HH:mm:ss')}</span>
              <If condition={simpleContent[activity.streamType]}>
                <ErdaIcon
                  size={16}
                  className="ml-2 text-sub hover:bg-default-04 cursor-pointer"
                  type={openMap[activity.id] ? 'up-4ffff0hh' : 'down-4ffff0f4'}
                  onClick={() => setOpenMap((prev) => ({ ...prev, [activity.id]: !prev[activity.id] }))}
                />
              </If>
            </div>
            <If condition={!!openMap[activity.id]}>
              <div className="ml-4 mt-2 text-xs">{activity.content}</div>
            </If>
          </div>
        </div>
      );
    });
  };

  const activeTab = tabs.find((t) => t.key === activeTabKey) as typeof tabs[0];
  return (
    <Spin spinning={loading}>
      <div className="flex flex-col pb-20">
        <div className="flex-h-center text-primary font-medium">
          <span className="text-base">{i18n.t('Log')}</span>
          <span className="w-[1px] h-[12px] bg-default-1 mx-4" />
          <SimpleTabs value={activeTabKey} tabs={tabs} onSelect={setActiveTabKey} />
        </div>
        <Holder when={!issueStreamList.length && !loading}>
          <div ref={listDomRef} className="ml-3">
            {activityListRender(activeTab.data)}
          </div>
        </Holder>
      </div>
    </Spin>
  );
};
