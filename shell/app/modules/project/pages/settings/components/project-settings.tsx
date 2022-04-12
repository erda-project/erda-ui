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
import { SettingTabs, ConfigLayout, MembersTable } from 'common';
import { goTo } from 'common/utils';
import ProjectInfo from './project-info';
import ProjectCluster from './project-cluster';
import ProjectLabel from './project-label';
import NotifyConfig from 'application/pages/settings/components/app-notify/notify-config';
import NotifyGroup from 'application/pages/settings/components/app-notify/common-notify-group';
import memberStore from 'common/stores/project-member';
import i18n from 'i18n';
import { MemberScope } from 'common/stores/member-scope';
import { Link } from 'react-router-dom';
import routeInfoStore from 'core/stores/route';
import BranchRule from 'project/common/components/branch-rule';
import IssueWorkflow from 'project/common/components/issue-workflow';
import { usePerm } from 'app/user/common';
import ScanRule from 'project/common/components/scan-rule';

const ProjectSettings = () => {
  const { projectId } = routeInfoStore.useStore((s) => s.params);
  const permMap = usePerm((s) => s.project);

  const dataSource = [
    {
      groupTitle: i18n.t('dop:General Settings'),
      groupKey: 'common',
      tabGroup: [
        {
          tabTitle: i18n.t('dop:Project Information'),
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
          tabTitle: i18n.t('dop:project quota'),
          tabKey: 'projectResource',
          content: <ProjectCluster hasEditAuth={false} />,
        },
        {
          tabTitle: i18n.t('dop:Project Member'),
          tabKey: 'projectMember',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('{name} member management', { name: i18n.t('project') }),
                  desc: (
                    <div>
                      {i18n.t('For editing members, setting member roles and role permissions, please refer to')}
                      <Link to={goTo.resolve.perm({ scope: 'project' })} target="_blank">
                        {i18n.t('role permissions description')}
                      </Link>
                    </div>
                  ),
                  children: (
                    <MembersTable
                      tableKey="project-setting-member"
                      scopeKey={MemberScope.PROJECT}
                      showAuthorize
                      hasConfigAppAuth
                    />
                  ),
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      groupTitle: i18n.t('dop:files'),
      groupKey: 'repository',
      tabGroup: [
        {
          tabTitle: i18n.t('dop:Branch Rule'),
          tabKey: 'branchRule',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('dop:Branch Rule'),
                  desc: i18n.t('dop:branch-config-tip'),
                  children: (
                    <BranchRule
                      tableKey="project-setting-branch-rule"
                      operationAuth={permMap.setting.branchRule.operation.pass}
                      scopeId={+projectId}
                      scopeType="project"
                    />
                  ),
                },
              ]}
            />
          ),
        },
        {
          tabTitle: i18n.t('dop:Quality Access Control'),
          tabKey: 'scanRule',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('dop:Quality Access Control'),
                  desc: i18n.t(
                    'dop:Code scanning configuration is mainly divided into rule configuration and code quality access control configuration. When the access control rules are met, it means that the code quality threshold cannot be passed.',
                  ),
                  children: (
                    <ScanRule
                      operationAuth={permMap.setting.scanRule.operation.pass}
                      scopeId={projectId}
                      scopeType="project"
                      tableKey="project-setting-scan"
                    />
                  ),
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      groupTitle: i18n.t('Artifacts'),
      groupKey: 'collaboration',
      tabGroup: [
        {
          tabTitle: i18n.t('dop:Artifacts Labels'),
          tabKey: 'releaseLabel',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('dop:Manage all artifacts labels'),
                  desc: i18n.t(
                    'dop:Labels can be used in release management, to quickly locate and filter related content.',
                  ),
                  children: <ProjectLabel />,
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      groupTitle: i18n.t('dop:project collaboration'),
      groupKey: 'collaboration',
      tabGroup: [
        {
          tabTitle: i18n.t('dop:Issue Workflow'),
          tabKey: 'issueManage',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('dop:Issue Workflow'),
                  desc: i18n.t(
                    'dop:Project issues include milestones, requirements, bugs and tasks, and you can set the workflow as needed.',
                  ),
                  children: <IssueWorkflow />,
                },
              ]}
            />
          ),
        },
        {
          tabTitle: i18n.t('dop:Issue labels'),
          tabKey: 'projectLabel',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('dop:Manage all project labels'),
                  desc: i18n.t(
                    'dop:Tags can be used for issue and test management, to quickly locate and filter relevant content.',
                  ),
                  children: <ProjectLabel />,
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      groupTitle: i18n.t('dop:Notification Management'),
      groupKey: 'notification',
      tabGroup: [
        {
          tabTitle: i18n.t('Notification'),
          tabKey: 'notifyConfig',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('dop:Help you better manage your notifications'),
                  children: (
                    <NotifyConfig
                      memberStore={memberStore}
                      commonPayload={{ scopeType: 'project', scopeId: projectId, module: 'workbench' }}
                      tableKey="project-setting-notify"
                    />
                  ),
                },
              ]}
            />
          ),
        },
        {
          tabTitle: i18n.t('dop:Notification Group'),
          tabKey: 'notifyGroup',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('dop:Set notification groups for notifications'),
                  children: (
                    <NotifyGroup
                      memberStore={memberStore}
                      commonPayload={{ scopeType: 'project', scopeId: String(projectId) }}
                      tableKey="project-setting-notify-group"
                    />
                  ),
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
  //     tabTitle: i18n.t('Parameter Settings'),
  //     tabKey: 'projectConfig',
  //     content: (
  //       <ConfigLayout
  //         sectionList={[
  //           {
  //             title: i18n.t('dop:configure-env'),
  //             children: <ConfigurationCenter type="project" />,
  //           },
  //         ]}
  //       />
  //     ),
  //   });
  // }

  return <SettingTabs dataSource={dataSource} />;
};

export default ProjectSettings;
