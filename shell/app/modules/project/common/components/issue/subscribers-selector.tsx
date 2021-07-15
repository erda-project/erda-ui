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
import { Menu, Dropdown } from 'app/nusi';
import { Icon as CustomIcon, MemberSelector, ImgHolder } from 'common';
import userStore from 'app/user/stores';
import { useUserMap } from 'core/stores/userMap';
import issueStore from 'project/stores/issues';
import {
  PreviewOpen as IconPreviewOpen,
  PreviewCloseOne as IconPreviewCloseOne,
  Plus as IconPlus,
  Right as IconRight,
} from '@icon-park/react';

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
  const { id: loginUserId, ...loginUser } = userStore.getState((s) => s.loginUser);
  const { subscribe, unsubscribe, getIssueDetail, getIssueStreams, batchSubscribe } = issueStore.effects;
  const memberRef = React.useRef<{ [p: string]: Function }>(null);
  const [subscribers, setSubscribers] = React.useState<Array<string | number>>([]);
  const [usersMap, setUsersMap] = React.useState({});

  const isFollowed = subscribers.includes(loginUserId);
  const userMap = useUserMap();

  React.useEffect(() => {
    const _userMap: object = { ...userMap };
    _userMap[loginUserId] || (_userMap[loginUserId] = { ...loginUser, userId: loginUserId });
    setUsersMap({ ..._userMap });
  }, [userMap]);

  React.useEffect(() => {
    setSubscribers(subscribersProps || []);
  }, [subscribersProps]);

  React.useEffect(() => {
    if (!issueID) {
      setSubscribers([loginUserId]);
    }
  }, [issueID]);

  const updateIssueDrawer = () => {
    getIssueDetail({ id: issueID as number, type: issueType });
    getIssueStreams({ type: issueType, id: issueID as number, pageNo: 1, pageSize: 50 });
  };

  const menu = (
    <Menu>
      <Menu.Item>
        {isFollowed ? (
          <div
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
            <IconPreviewCloseOne />
            {i18n.t('project:unfollow')}
          </div>
        ) : (
          <div
            onClick={async () => {
              if (issueID) {
                await subscribe({ id: issueID });
                updateIssueDrawer();
              } else {
                setSubscribers([...subscribers, loginUserId]);
              }
            }}
          >
            <IconPreviewOpen />
            {i18n.t('project:follow')}
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
              onClick={(e) => {
                e.stopPropagation();
                memberRef.current?.show(true);
              }}
            >
              <IconPlus />
              {i18n.t('project:Add Followers')}
              <IconRight className="add-follower-btn" />
            </span>
          )}
        />
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item>
        <div onClick={(e) => e.stopPropagation()}>
          <div className="followers-num">
            {subscribers.length !== 0
              ? i18n.t('project:{num} members are following', { num: subscribers.length })
              : i18n.t('project:no member is concerned about it')}
          </div>
          <div className="followers">
            {subscribers.map((item) => {
              const user = usersMap[item] || {};
              return (
                <div key={user.id}>
                  <ImgHolder
                    src={user.avatar}
                    text={user.nick ? user.nick.substring(0, 1) : i18n.t('none')}
                    rect="20x20"
                    type="avatar"
                  />
                  <span className="ml4">{user.nick ?? ''}</span>
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
        <CustomIcon
          type="watch"
          className="followed"
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
        <CustomIcon
          type="watch"
          className="notFollowed"
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
        onVisibleChange={(visible) => {
          if (!visible) {
            setData({ ...data, subscribers });
          }
        }}
      >
        <span className="attention-dropdown-btn ml4">
          {subscribers.length !== 0
            ? i18n.t('project:{num} people followed', { num: subscribers.length })
            : i18n.t('project:no attention')}
          <CustomIcon type="caret-down" className="ml2 mr0" />
        </span>
      </Dropdown>
    </>
  );
};
