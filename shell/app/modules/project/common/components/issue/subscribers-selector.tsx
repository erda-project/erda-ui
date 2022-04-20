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
import i18n from 'i18n';
import { Menu, Dropdown, Avatar } from 'antd';
import { MemberSelector, ErdaIcon } from 'common';
import userStore from 'app/user/stores';
import { useUserMap } from 'core/stores/userMap';
import issueStore from 'project/stores/issues';
import { getAvatarChars } from 'app/common/utils';

interface IProps {
  subscribers: string[];
  issueID?: number;
  issueType: string;
  projectId: string;
  data: object;
  setData: (data: object) => void;
}

export const SubscribersSelector = (props: IProps) => {
  const { subscribers: subscribersProps, issueID, issueType, projectId, setData, data } = props;
  const loginUser = userStore.getState((s) => s.loginUser);
  const { id: loginUserId } = loginUser;
  const { subscribe, unsubscribe, getIssueDetail, getIssueStreams, batchSubscribe } = issueStore.effects;
  const memberRef = React.useRef<{ show: (vis: boolean) => void }>(null);
  const [subscribers, setSubscribers] = React.useState<Array<string | number>>([]);
  const [usersMap, setUsersMap] = React.useState({});

  const isFollowed = subscribers.includes(loginUserId);
  const userMap = useUserMap();

  React.useEffect(() => {
    const _userMap: object = { ...userMap };
    _userMap[loginUserId] || (_userMap[loginUserId] = { ...loginUser, userId: loginUserId });
    setUsersMap({ ..._userMap });
  }, [userMap, loginUserId, loginUser]);

  React.useEffect(() => {
    setSubscribers(subscribersProps || []);
  }, [subscribersProps]);

  React.useEffect(() => {
    if (!issueID) {
      setSubscribers([loginUserId]);
    }
  }, [issueID, loginUserId]);

  const updateIssueDrawer = () => {
    getIssueDetail({ id: issueID as number });
    getIssueStreams({ type: issueType, id: issueID as number, pageNo: 1, pageSize: 50 });
  };

  const menu = (
    <Menu>
      <Menu.Item>
        {isFollowed ? (
          <div
            className="px-4 py-1 h-8 flex items-center"
            onClick={async () => {
              if (issueID) {
                await unsubscribe({ id: issueID });
                updateIssueDrawer();
              } else {
                const index = subscribers.findIndex((item) => item === loginUserId);
                subscribers.splice(index, 1);
                setSubscribers([...subscribers]);
              }
            }}
          >
            <ErdaIcon className="mr-1" type="weiguanzhu" size="20" />
            {i18n.t('dop:Unfollow')}
          </div>
        ) : (
          <div
            className="px-4 py-1 h-8 flex items-center"
            onClick={async () => {
              if (issueID) {
                await subscribe({ id: issueID });
                updateIssueDrawer();
              } else {
                setSubscribers([...subscribers, loginUserId]);
              }
            }}
          >
            <ErdaIcon type="yiguanzhu" className="mr-1" size="20" />
            {i18n.t('dop:Follow')}
          </div>
        )}
      </Menu.Item>
      <Menu.Item>
        <MemberSelector
          scopeType="project"
          className="issue-member-select"
          dropdownClassName="issue-member-select-dropdown"
          scopeId={projectId}
          allowClear={false}
          ref={memberRef}
          mode="multiple"
          value={subscribers || []}
          onVisibleChange={async (visible: boolean, values: any[][]) => {
            const ids: string[] = values[0] || [];
            const options: Array<{ userId: number }> = values[1] || [];
            // this event fires too often
            if (!visible && subscribers.join(',') !== ids.join(',')) {
              if (issueID) {
                await batchSubscribe({ id: issueID, subscribers: ids });
                updateIssueDrawer();
              } else {
                const newUsers = options.filter((item) => !usersMap[item.userId]);
                newUsers.forEach((item) => {
                  usersMap[item.userId] = item;
                });
                setUsersMap({ ...usersMap });
                setSubscribers(ids);
              }
            }
          }}
          resultsRender={() => (
            <span
              className="flex items-center px-4"
              onClick={(e) => {
                e.stopPropagation();
                memberRef.current?.show(true);
              }}
            >
              <ErdaIcon type="plus" size="20" className="mr-1" />
              {i18n.t('dop:Add followers')}
              <ErdaIcon type="right" size="14" className="add-follower-btn" />
            </span>
          )}
        />
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item>
        <div onClick={(e) => e.stopPropagation()}>
          <div className="followers-num px-4">
            {subscribers.length !== 0
              ? i18n.t('dop:{num} followers-ing', { num: subscribers.length })
              : i18n.t('dop:no member is concerned about it')}
          </div>
          <div className="followers px-4">
            {subscribers.map((item) => {
              const user = usersMap[item] || {};
              return (
                <div key={user.userId || user.id}>
                  <Avatar src={user.avatar} size="small">
                    {user.nick ? getAvatarChars(user.nick) : i18n.t('None')}
                  </Avatar>
                  <span className="ml-1">{user.nick ?? ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {isFollowed ? (
        <ErdaIcon
          type="yiguanzhu"
          size="20px"
          className="px-2 py-1 bg-default-06 cursor-pointer"
          disableCurrent
          onClick={async () => {
            if (issueID) {
              await unsubscribe({ id: issueID });
              updateIssueDrawer();
            } else {
              const index = subscribers.findIndex((item) => item === loginUserId);
              subscribers.splice(index, 1);
              setSubscribers([...subscribers]);
            }
          }}
        />
      ) : (
        <ErdaIcon
          type="weiguanzhu"
          size="20px"
          className="px-2 py-1 bg-default-06 cursor-pointer text-default-4 hover:text-default-8"
          onClick={async () => {
            if (issueID) {
              await subscribe({ id: issueID });
              updateIssueDrawer();
            } else {
              setSubscribers([...subscribers, loginUserId]);
            }
          }}
        />
      )}
      <Dropdown
        overlay={menu}
        trigger={['click']}
        overlayClassName="attention-dropdown"
        onVisibleChange={(visible: boolean) => {
          if (!visible) {
            setData({ ...data, subscribers });
          }
        }}
      >
        <span className="ml-0.5 p-1 bg-default-06 text-default-4 cursor-pointer hover:text-default-8 flex-all-center">
          <span className="text-default-8 text-sm">
            {subscribers.length !== 0
              ? i18n.t('dop:{num} followers', { num: subscribers.length })
              : i18n.t('dop:No followers')}
          </span>
          <ErdaIcon type="caret-down" className="ml-0.5 mr-0" />
        </span>
      </Dropdown>
    </>
  );
};
