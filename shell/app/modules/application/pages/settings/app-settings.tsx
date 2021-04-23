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
import { isEmpty, get } from 'lodash';
import { SettingsTabs, ConfigLayout, MembersTable } from 'common';
import { AppInfo } from './components/app-info';
import { MergeDes } from './components/app-merge-description';
import NotifyGroup from './components/app-notify/common-notify-group';
import NotifyConfig from './components/app-notify/notify-config';
import { MobileConfig, PipelineConfig, DeployConfig } from './components/app-variable-config';
import VersionPushConfig from './components/app-version-push';
import LibraryImport from './components/app-library-reference';
import CertificateImport from './components/app-certificate-reference';
import { appMode } from 'application/common/config';
import memberStore from 'common/stores/application-member';
import i18n from 'i18n';
import { Link } from 'react-router-dom';
import { MemberScope } from 'app/common/stores/_member';
import BranchRule from 'project/common/components/branch-rule';
import { usePerm } from 'app/user/common';
import { goTo } from 'common/utils';
import './app-settings.scss';
import appStore from 'application/stores/application';
import routeInfoStore from 'common/stores/route';

const showMap = {
  [appMode.SERVICE]: ['common', 'work', 'repository', 'pipeline', 'deploy', 'notification'],
  [appMode.MOBILE]: ['common', 'work', 'repository', 'notification', 'deploy', 'more'],
  [appMode.LIBRARY]: ['common', 'work', 'repository', 'notification', 'deploy', 'more'],
  [appMode.BIGDATA]: ['common', 'work', 'repository', 'notification'],
  [appMode.ABILITY]: ['common', 'work', 'deploy', 'notification'],
};

export const PureAppSettings = () => {
  const appDetail = appStore.useStore(s => s.detail);
  const params = routeInfoStore.useStore(s => s.params);
  const branchRuleOperation = usePerm(s => s.app.setting.branchRule.operation.pass);

  const settingSource = [
    {
      groupTitle: i18n.t('application:common settings'),
      groupKey: 'common',
      tabGroup: [
        {
          tabTitle: i18n.t('application:application information'),
          tabKey: 'appInfo',
          content: <AppInfo />,
        },
        {
          tabTitle: i18n.t('application:app member'),
          tabKey: 'appMember',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('{name} member management', { name: i18n.t('application') }),
                  desc: (
                    <div>
                      {i18n.t('edit members, set member roles, role permissions please refer to')}
                      <Link to={goTo.resolve.perm({ scope: 'app' })} target="_blank">{i18n.t('role permissions description')}</Link>
                    </div>
                  ),
                  children: <MembersTable scopeKey={MemberScope.APP} />,
                },
                {
                  title: i18n.t('application:view the project member'),
                  children: <MembersTable readOnly hideBatchOps scopeKey={MemberScope.PROJECT} />,
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      groupTitle: i18n.t('application:repository'),
      groupKey: 'repository',
      tabGroup: [
        {
          tabTitle: i18n.t('application:merge description'),
          tabKey: 'mrDesc',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('application:set the default merge request description template'),
                  children: <MergeDes />,
                },
              ]}
            />
          ),
        },
        {
          tabTitle: i18n.t('project:branch rule'),
          tabKey: 'branchRule',
          content: (
            <ConfigLayout
              sectionList={[{
                title: i18n.t('application:application branch rule'),
                desc: i18n.t('application:application-branch-rule-desc'),
                children: <BranchRule operationAuth={branchRuleOperation} scopeId={+params.appId} scopeType='app' />,
              }]}
            />
          ),
        },
        // {
        //   tabTitle: i18n.t('application:repository settings'),
        //   tabKey: 'repoSetting',
        //   content: (
        //     <ConfigLayout
        //       sectionList={[{
        //         title: i18n.t('application:repository settings'),
        //         children: <RepoSetting appDetail={appDetail} />,
        //       }]}
        //     />
        //   ),
        // },
      ],
    },
    {
      groupTitle: i18n.t('application:pipeline'),
      groupKey: 'pipeline',
      tabGroup: [
        {
          tabTitle: i18n.t('application:variable configuration'),
          tabKey: 'privateConfig',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('application:variable configuration'),
                  desc: i18n.t('application:configure-pipeline-tip'),
                  children: <PipelineConfig />,
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      groupTitle: i18n.t('application:deploy center'),
      groupKey: 'deploy',
      tabGroup: [
        {
          tabTitle: `${i18n.t('application:parameter setting')}`,
          tabKey: 'appConfig',
          content: (
            <ConfigLayout
              sectionList={[
                {
                  title: i18n.t('application:variable-config'),
                  desc: i18n.t('application:configure-deployment-environment'),
                  children: <DeployConfig />,
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      groupTitle: i18n.t('application:notification management'),
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
                  children: <NotifyConfig memberStore={memberStore} commonPayload={{ scopeType: 'app', scopeId: params.appId, module: 'workbench' }} />,
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
                  children: <NotifyGroup memberStore={memberStore} commonPayload={{ scopeType: 'app', scopeId: params.appId }} />,
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      groupTitle: i18n.t('application:more settings'), // 暂时只有库应用和移动应用才有
      groupKey: 'more',
      tabGroup: (() => {
        const list = [
          {
            tabTitle: i18n.t('application:variable configuration'),
            tabKey: 'variableConfig',
            content: (
              <ConfigLayout
                sectionList={[
                  {
                    title: i18n.t('application:variable configuration'),
                    desc: i18n.t('application:configure-pipeline-tip'),
                    children: <MobileConfig />,
                  },
                ]}
              />
            ),
          },
          {
            tabTitle: i18n.t('application:version push'),
            tabKey: 'versionPush',
            content: (
              <ConfigLayout
                sectionList={[
                  {
                    title: i18n.t('application:auto-push-after-relate'),
                    children: <VersionPushConfig />,
                  },
                ]}
              />
            ),
          },
        ];
        if ([appMode.MOBILE].includes(get(appDetail, 'mode'))) {
          list.push({
            tabTitle: i18n.t('application:subscribe module'),
            tabKey: 'libraryImport',
            content: (
              <ConfigLayout
                sectionList={[
                  {
                    title: i18n.t('application:refer-to-market'),
                    children: <LibraryImport />,
                  },
                ]}
              />
            ),
          }, {
            tabTitle: i18n.t('application:reference certificate'),
            tabKey: 'certificateImport',
            content: (
              <ConfigLayout
                sectionList={[
                  {
                    title: i18n.t('application:apply-reference-certificate'),
                    children: <CertificateImport />,
                  },
                ]}
              />
            ),
          });
        }
        return list;
      })(),
    },
  ];
  let dataSource = settingSource;
  if (!isEmpty(appDetail)) {
    const { mode } = appDetail;
    dataSource = settingSource.filter(item => (showMap[mode].includes(item.groupKey)));
  }

  return (
    <SettingsTabs
      className="app-settings-main"
      dataSource={dataSource}
    />
  );
};

export default PureAppSettings;
