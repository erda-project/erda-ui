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

import { Holder, Avatar } from 'common';
import { fromNow } from 'common/utils';
import { useLoading } from 'app/common/stores/loading';
import { map } from 'lodash';
import moment from 'moment';
import { Spin, Timeline } from 'app/nusi';
import issueStore from 'project/stores/issues';
import userMapStore from 'app/common/stores/user-map';
import * as React from 'react';
import { goTo } from 'app/common/utils';
import Markdown from 'common/utils/marked';
import routeInfoStore from 'app/common/stores/route';
import i18n from 'app/i18n';
import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';

interface IProps {
  type: ISSUE_TYPE;
}

const { Item: TimelineItem } = Timeline;

export const IssueActivities = (props: IProps) => {
  const { type } = props;
  const userMap = userMapStore.useStore(s => s);
  const { projectId } = routeInfoStore.getState(s => s.params);

  const issueStreamList: ISSUE.IssueStream[] = issueStore.useStore(s => s[`${type.toLowerCase()}StreamList`]);
  const [loading] = useLoading(issueStore, ['getIssueStreams']);
  const daySplit = {};
  issueStreamList.forEach((item) => {
    const day = moment(item.updatedAt).format('YYYY-MM-DD');
    daySplit[day] = daySplit[day] || [];
    daySplit[day].push(item);
  });

  const renderStream = (stream: ISSUE.IssueStream) => {
    const { id: sId, streamType, content, updatedAt, operator, mrInfo } = stream;
    const user = userMap[operator] || {};
    let renderContent = null;
    switch (streamType) {
      case 'Comment':
        renderContent = (
          <>
            <div>
              <Avatar name={user.nick || user.name} showName />
                &nbsp;
              <span>
                {i18n.t('project:remarked at')}
              </span>
                  &nbsp;
              <span>
                {fromNow(updatedAt)}
              </span>
            </div>
            {streamType !== 'Comment' && <span className="ml8">{content}</span>}
            {streamType === 'Comment' &&
              <article
                className="md-content"
                style={{ minHeight: 'auto' }}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: Markdown(content || '') }}
              />
            }
          </>
        );
        break;
      case 'RelateMR': {
        const { appID, mrID, mrTitle } = mrInfo as ISSUE.IssueStreamMrInfo;
        renderContent = (
          <>
            <Avatar name={user.nick || user.name} showName />
            <span className="mx8">{i18n.t('project:add relation to MR')}:</span>
            <a onClick={() => goTo(goTo.pages.appMr, { projectId, appId: appID, mrId: mrID, jumpOut: true })}>
              {mrTitle}
            </a>
          </>
        );
        break;
      }
      default:
        renderContent = (
          <div>
            <Avatar name={user.nick || user.name} showName />
            <span className="ml8">{content}</span>
          </div>
        );
        break;
    }
    return (
      <div key={sId} className="border-bottom pa12">
        {renderContent}
        <div className="color-text-desc mt4">
          {moment(updatedAt).format('YYYY-MM-DD HH:mm:ss')}
        </div>
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <Holder when={!issueStreamList.length && !loading}>
        <Timeline className="mt20">
          {map(daySplit, (items: [], day) => (
            <TimelineItem key={day}>
              <div className="day-split">{day}</div>
              <div className="border-top border-left border-right">
                {items.map(renderStream)}
              </div>
            </TimelineItem>
          ))}
          <TimelineItem />
        </Timeline>
      </Holder>
    </Spin>
  );
};
