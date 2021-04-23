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
import { SettingsTabs, ConfigLayout, MembersTable } from 'common';
import { goTo } from 'common/utils';
import ProjectInfo from './project-info';
import ProjectCluster from './project-cluster';
import ProjectLabel from './project-label';
import NotifyConfig from 'application/pages/settings/components/app-notify/notify-config';
import NotifyGroup from 'application/pages/settings/components/app-notify/common-notify-group';
import memberStore from 'common/stores/project-member';
import i18n from 'i18n';
import { MemberScope } from 'app/common/stores/_member';
import { Link } from 'react-router-dom';
import routeInfoStore from 'app/common/stores/route';
import BranchRule from 'project/common/components/branch-rule';
import IssueWorkflow from 'project/common/components/issue-workflow';
import { usePerm } from 'app/user/common';
import ScanRule from 'project/common/components/scan-rule';

const ProjectSettings = () => {
  const { projectId } = routeInfoStore.useStore(s => s.params);
  const permMap = usePerm(s => s.project);

  const dataSource = [
    {
      groupTitle: i18n.t('project:common settings'),
      groupKey: 'common',
      tabGroup: [
        {
          tabTitle: i18n.t('project:project info'),
          tabKey: 'projectInfo',
          content: (
            <ProjectInfo
              canEdit={permMap.editProject.pass}
              canEditQuota={false}
              canDelete={permMap.deleteProject.pass}
              showQuotaTip={false}
            />
          ),
        },
        {
          tabTitle: i18n.t('project:cluster setting'),
          tabKey: 'clusterSetting',
          content: <ProjectCluster hasEditAuth={false} />,
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
                      <Link to={goTo.resolve.perm({ scope: 'project' })} target="_blank">{i18n.t('role permissions description')}</Link>
                    </div>
                  ),
                  children: <MembersTable scopeKey={MemberScope.PROJECT} showAuthorize />,
                },
              ]}
            />
          ),
        },

      ],
    },
    {
      groupTitle: i18n.t('repository'),
      groupKey: 'repository',
      tabGroup: [
        {
          tabTitle: i18n.t('project:branch rule'),
          tabKey: 'branchRule',
          content: (
            <ConfigLayout
              sectionList={[{
                title: i18n.t('project:branch rule'),
                desc: i18n.t('project:branch-config-tip'),
                children: <BranchRule operationAuth={permMap.setting.branchRule.operation.pass} scopeId={+projectId} scopeType='project' />,
              }]}
            />
          ),
        },
        {
          tabTitle: i18n.t('project:code quality access control'),
          tabKey: 'scanRule',
          content: (
            <ConfigLayout
              sectionList={[{
                title: i18n.t('project:code quality access control'),
                desc: i18n.t('project:access-control-desc'),
                children: <ScanRule
                  operationAuth={permMap.setting.scanRule.operation.pass}
                  scopeId={projectId}
                  scopeType='project'
                />,
              }]}
            />
          ),
        },
      ],
    },
    {
      groupTitle: i18n.t('project:project collaboration'),
      groupKey: 'collaboration',
      tabGroup: [
        {
          tabTitle: i18n.t('project:issue workflow'),
          tabKey: 'issueManage',
          content: (
            <ConfigLayout
              sectionList={[{
                title: i18n.t('project:issue workflow'),
                desc: i18n.t('project:issue-workflow-config-tip'),
                children: <IssueWorkflow />,
              }]}
            />
          ),
        },
        {
          tabTitle: i18n.t('project:label setting'),
          tabKey: 'projectLabel',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('project:manage all project labels'),
                  desc: i18n.t('project:tag-config-tip'),
                  children: <ProjectLabel />,
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
          tabTitle: i18n.t('application:notification item'),
          tabKey: 'notifyConfig',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('application:help you better organize your notifications'),
                  children: <NotifyConfig memberStore={memberStore} commonPayload={{ scopeType: 'project', scopeId: projectId, module: 'workbench' }} />,
                },
              ]}
            />
          ),
        },
        {
          tabTitle: i18n.t('application:notification group'),
          tabKey: 'notifyGroup',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('application:organize notification groups to set up notifications'),
                  children: <NotifyGroup memberStore={memberStore} commonPayload={{ scopeType: 'project', scopeId: String(projectId) }} />,
                },
              ]}
            />
          ),
        },

      ],
    },
  ];

  // if (permMap.setting.paramSetting.pass) {
  //   dataSource.splice(6, 0, {
  //     tabTitle: i18n.t('parameter setting'),
  //     tabKey: 'projectConfig',
  //     content: (
  //       <ConfigLayout
  //         sectionList={[
  //           {
  //             title: i18n.t('project:configure-env'),
  //             children: <ConfigurationCenter type="project" />,
  //           },
  //         ]}
  //       />
  //     ),
  //   });
  // }

  return (
    <SettingsTabs
      dataSource={dataSource}
    />
  );
};


export default ProjectSettings;
