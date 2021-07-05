import React from 'react';
import { Menu, Dropdown } from 'app/nusi';
import { Icon as CustomIcon, MemberSelector } from 'common';
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
  const [subscribers, setSubscribers] = React.useState<(string | number)[]>([]);
  const [usersMap, setUsersMap] = React.useState({});

  let isFollowed = subscribers.includes(loginUserId);
  const userMap = useUserMap();

  React.useEffect(() => {
    const _userMap: object = { ...userMap };
    _userMap[loginUserId] || (_userMap[loginUserId] = { ...loginUser, userId: loginUserId });
    setUsersMap({ ..._userMap });
  }, []);

  React.useEffect(() => {
    setSubscribers(subscribersProps || []);
  }, [subscribersProps]);

  const menu = (
    <Menu>
      <Menu.Item>
        {isFollowed ? (
          <div
            onClick={async () => {
              if (issueID) {
                await unsubscribe({ id: issueID });
                getIssueDetail({ id: issueID, type: issueType });
                getIssueStreams({ type: issueType, id: issueID, pageNo: 1, pageSize: 50 });
              } else {
                let index = subscribers.findIndex((item) => item === loginUserId);
                subscribers.splice(index, 1);
                setSubscribers([...subscribers]);
              }
            }}
          >
            <IconPreviewCloseOne />
            取消关注
          </div>
        ) : (
          <div
            onClick={async () => {
              if (issueID) {
                await subscribe({ id: issueID });
                getIssueDetail({ id: issueID, type: issueType });
                getIssueStreams({ type: issueType, id: issueID, pageNo: 1, pageSize: 50 });
              } else {
                setSubscribers([...subscribers, loginUserId]);
              }
            }}
          >
            <IconPreviewOpen />
            关注
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
          onChange={async (ids: Array<number | string>, options: Array<{ userId: string }>) => {
            if (issueID) {
              await batchSubscribe({ id: issueID, subscribers: ids });
              getIssueDetail({ id: issueID, type: issueType });
              getIssueStreams({ type: issueType, id: issueID, pageNo: 1, pageSize: 50 });
            } else {
              let newUsers = options.filter((item) => !usersMap[item.userId]);
              newUsers.forEach((item) => {
                usersMap[item.userId] = item;
              });
              setUsersMap({ ...usersMap });
              setSubscribers(ids);
            }
          }}
          resultsRender={() => (
            <span
              onClick={(e) => {
                e.stopPropagation();
                memberRef.current?.show();
              }}
            >
              <IconPlus />
              添加关注人
              <IconRight className="add-follower-btn" />
            </span>
          )}
        />
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item>
        <div onClick={(e) => e.stopPropagation()}>
          <div className="followers-num">{subscribers ? `${subscribers.length}位成员正在关注` : '暂无成员关注'}</div>
          {subscribers?.map((item: string | number) => (
            <div>{usersMap[item]?.nick}</div>
          ))}
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {isFollowed ? (
        <CustomIcon
          type="yiguanzhu"
          className="followed"
          onClick={async () => {
            if (issueID) {
              await unsubscribe({ id: issueID });
              getIssueDetail({ id: issueID, type: issueType });
              getIssueStreams({ type: issueType, id: issueID, pageNo: 1, pageSize: 50 });
            } else {
              let index = subscribers.findIndex((item) => item === loginUserId);
              subscribers.splice(index, 1);
              setSubscribers([...subscribers]);
            }
          }}
        />
      ) : (
        <CustomIcon
          type="guanzhu"
          className="notFollowed"
          onClick={async () => {
            if (issueID) {
              await subscribe({ id: issueID });
              getIssueDetail({ id: issueID, type: issueType });
              getIssueStreams({ type: issueType, id: issueID, pageNo: 1, pageSize: 50 });
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
            setData({ ...data, subscribers: subscribers });
          }
        }}
      >
        <span className="attention-dropdown-btn ml4">
          {subscribers ? `${subscribers.length}人关注` : '无人关注'}
          <CustomIcon type="caret-down" className="ml2 mr0" />
        </span>
      </Dropdown>
    </>
  );
};
