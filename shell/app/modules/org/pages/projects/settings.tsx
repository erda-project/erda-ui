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

import { MemberScope } from 'app/common/stores/_member';
import { ConfigLayout, MembersTable, SettingsTabs } from 'common';
import i18n from 'i18n';
import * as React from 'react';
import { goTo } from 'common/utils';
import ProjectInfo from 'project/pages/settings/components/project-info';
import ProjectCluster from 'project/pages/settings/components/project-cluster';
import ProjectRollback from 'project/pages/settings/components/project-rollback';
import { Link } from 'react-router-dom';

const Setting = () => {
  const dataSource = [
    {
      tabTitle: i18n.t('project:project info'),
      tabKey: 'projectInfo',
      content: <ProjectInfo canEdit canEditQuota canDelete showQuotaTip />,
    },
    {
      tabTitle: i18n.t('project:cluster setting'),
      tabKey: 'clusterSetting',
      content: <ProjectCluster hasEditAuth />,
    },
    {
      tabTitle: i18n.t('project:rollback setting'),
      tabKey: 'rollbackSetting',
      content: <ProjectRollback hasEditAuth />,
    },
    {
      tabTitle: i18n.t('project:project member'),
      tabKey: 'projectMember',
      content: (
        <ConfigLayout
          sectionList={[
            {
              title: i18n.t('{name} member management', { name: i18n.t('project') }),
              desc: (
                <div>
                  {i18n.t('edit members, set member roles, role permissions please refer to')}
                  <Link to={goTo.resolve.perm({ scope: 'project'})} target="_blank">{i18n.t('role permissions description')}</Link>
                </div>
              ),
              children: <MembersTable scopeKey={MemberScope.PROJECT} overwriteAuth={{ add: true, edit: true, delete: true }} />,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <SettingsTabs
      dataSource={dataSource}
    />
  );
};


export default Setting;
