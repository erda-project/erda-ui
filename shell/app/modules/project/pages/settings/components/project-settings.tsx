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
import { ConfigLayout, MembersTable, SettingTabs } from 'common';
import { firstCharToUpper, goTo } from 'common/utils';
import ProjectInfo from './project-info';
import ProjectCluster from './project-cluster';
import ProjectLabel from './project-label';
import NotifyConfig from 'application/pages/settings/components/app-notify/notify-config';
import NotifyGroup from 'application/pages/settings/components/app-notify/common-notify-group';
import memberStore from 'common/stores/project-member';
import i18n from 'i18n';
import { MemberScope } from 'common/stores/member-scope';
import routeInfoStore from 'core/stores/route';
import permStore from 'user/stores/permission';
import IssueWorkflow from 'project/common/components/issue-workflow';
import { usePerm } from 'app/user/common';
import ScanRule from 'project/common/components/scan-rule';
import { replaceWithLink } from 'app/common/utils';
import BranchPolicy from './workflow-setting/branch-policy';
import DevOpsWorkflow from './workflow-setting/devops-workflow';
import IssueFieldManage from 'org/pages/projects/issue-field-manage';
import IssueTypeManage from 'org/pages/projects/issue-type-manage';

const ProjectSettings = () => {
  const { projectId } = routeInfoStore.useStore((s) => s.params);
  const permProject = permStore.useStore((s) => s.project);
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
                  title: firstCharToUpper(i18n.t('{name} member management', { name: i18n.t('project') })),
                  desc: (
                    <div>
                      {replaceWithLink(
                        i18n.t('Edit members and set member roles. See Role Permission Description for details.'),
                        goTo.resolve.perm({ scope: 'app' }),
                      )}
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
      groupTitle: i18n.t('dop:Repository'),
      groupKey: 'repository',
      tabGroup: [
        {
          tabTitle: i18n.t('dop:Quality Access Control'),
          tabKey: 'scanRule',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('dop:Quality Access Control'),
                  desc: i18n.t(
                    'dop:The code scanning configuration is mainly to set rules and quality access control. If the access control rules are met, it means that the code quality failed.',
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
        {
          tabTitle: i18n.s('branch policy', 'dop'),
          tabKey: 'branchPolicy',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.s('Branch policy', 'dop'),
                  desc: i18n.s(
                    'The project branch management specification mainly regulates which branch different branches are cut from and finally merged into that branch.',
                    'dop',
                  ),
                  children: (
                    <BranchPolicy projectId={projectId} editAuth={permMap.setting.customWorkflow.operation.pass} />
                  ),
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      groupTitle: i18n.t('Label'),
      groupKey: 'label',
      tabGroup: [
        {
          tabTitle: i18n.t('dop:Artifact Label'),
          tabKey: 'releaseLabel',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('dop:Manage all artifact labels'),
                  desc: i18n.t(
                    'dop:Labels can be used in release management, to quickly locate and filter related content.',
                  ),
                  children: <ProjectLabel />,
                },
              ]}
            />
          ),
        },
        {
          tabTitle: i18n.t('dop:Issue label'),
          tabKey: 'projectLabel',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('dop:Manage all project labels'),

                  desc: (
                    <div>
                      <div>
                        {i18n.t(
                          'dop:Labels can be used in issue management and test management, to quickly locate and filter related content.',
                        )}
                      </div>

                      <div>
                        {i18n.s(
                          'It is recommended to use the form of type/scope. For example, type is kind: indicates the item type team: indicates the team, src: indicates the source, area: indicates the field or module, and highlight: indicates the focus. Combinations such as: kind/security; team/test; src/customer appeal; area/unified authentication; highlight/delay risk',
                          'dop',
                        )}
                      </div>
                    </div>
                  ),
                  children: <ProjectLabel />,
                },
              ]}
            />
          ),
        },
      ],
    },
    ...(permProject?.roles?.some((item: string) => ['Owner', 'PM', 'Lead'].includes(item))
      ? [
          {
            groupTitle: i18n.t('project'),
            groupKey: 'project',
            tabGroup: [
              {
                tabTitle: i18n.t('dop:Issue Type'),
                tabKey: 'issueType',
                content: <IssueTypeManage />,
              },
              {
                tabTitle: i18n.t('dop:Custom Issue Field'),
                tabKey: 'issueField',
                content: <IssueFieldManage />,
              },
            ],
          },
        ]
      : []),
    {
      groupTitle: i18n.t('dop:workflow'),
      groupKey: 'workflow',
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
          tabTitle: i18n.t('dop:R&D Workflow'),
          tabKey: 'workflow',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('dop:R&D Workflow'),
                  desc: i18n.t(
                    'dop:You can configure stages of the R&D process here, such as development, testing, staging and production, as well as code branches, artifact types, deployment environments and steps required for these stages.',
                  ),
                  children: (
                    <DevOpsWorkflow projectId={projectId} editAuth={permMap.setting.customWorkflow.operation.pass} />
                  ),
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
