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

import * as React from 'react';
import i18n from 'i18n';
import { SettingsTabs, ConfigLayout, MembersTable } from 'common';
import { goTo } from 'common/utils';
import orgStore from 'app/org-home/stores/org';
import NotifyGroup from 'application/pages/settings/components/app-notify/common-notify-group';
import memberStore from 'common/stores/org-member';
import BlockNetwork from 'org/pages/setting/block-network';
import { OrgInfo } from './org-info';
import { OperationLogSetting } from './operation-log-setting';
import { MemberScope } from 'app/common/stores/_member';
import { MemberLabels } from './member-label';
import { Link } from 'react-router-dom';
import IssueFieldManage from '../projects/issue-field-manage';
import IssueTypeManage from '../projects/issue-type-manage';

import './org-setting.scss';

export const OrgSetting = () => {
  const orgId = orgStore.getState(s => s.currentOrg.id);

  const dataSource = [
    {
      groupTitle: i18n.t('application:common settings'),
      groupKey: 'common',
      tabGroup: [
        {
          tabTitle: i18n.t('org:org info'),
          tabKey: 'orgInfo',
          content: <OrgInfo />,
        },
        {
          tabTitle: i18n.t('org:org member'),
          tabKey: 'orgMember',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('{name} member management', { name: i18n.t('organization') }),
                  desc: (
                    <div>
                      {i18n.t('edit members, set member roles, role permissions please refer to')}
                      <Link to={goTo.resolve.perm({ scope: 'org'})} target="_blank">{i18n.t('role permissions description')}</Link>
                    </div>
                  ),
                  children: <MembersTable scopeKey={MemberScope.ORG} />,
                },
              ]}
            />
          ),
        },
        {
          tabTitle: i18n.t('member label'),
          tabKey: 'memberLabel',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('org:organization member label'),
                  children: <MemberLabels />,
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      groupTitle: i18n.t('project'),
      groupKey: 'project',
      tabGroup: [
        {
          tabTitle: i18n.t('project:joint issue type'),
          tabKey: 'issueType',
          content: <IssueTypeManage />,
        },
        {
          tabTitle: i18n.t('project:issue custom fields'),
          tabKey: 'issueField',
          content: <IssueFieldManage />,
        },
      ],
    },
    {
      groupTitle: i18n.t('deploy'),
      groupKey: 'deploy',
      tabGroup: [
        {
          tabTitle: i18n.t('org:block network'),
          tabKey: 'block-network',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('org:tips of block network'),
                  children: <BlockNetwork />,
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      groupTitle: i18n.t('log'),
      groupKey: 'log',
      tabGroup: [
        {
          tabTitle: i18n.t('org:audit log'),
          tabKey: 'operation log',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('org:audit log'),
                  desc: i18n.t('org:Clean up at 3am every day'),
                  children: <OperationLogSetting />,
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      groupTitle: i18n.t('project:notification management'),
      groupKey: 'notification',
      tabGroup: [
        {
          tabTitle: i18n.t('application:notification group'),
          tabKey: 'notifyGroup',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('application:organize notification groups to set up notifications'),
                  children: <NotifyGroup memberStore={memberStore} commonPayload={{ scopeType: 'org', scopeId: `${orgId}` }} />,
                },
              ]}
            />
          ),
        },
      ],
    },
  ];

  return (
    <SettingsTabs
      className="org-settings-main"
      dataSource={dataSource}
    />
  );
};
