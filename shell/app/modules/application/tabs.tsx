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
import { usePerm } from 'app/user/common';
import layoutStore from 'layout/stores/layout';
import appStore from './stores/application';
import routeInfoStore from 'core/stores/route';
import { appMode } from './common/config';
import { filter } from 'lodash';
import { HeadAppSelector } from './common/app-selector';
import { goTo } from 'app/common/utils';
import projectStore from 'app/modules/project/stores/project';

interface ITab {
  show?: boolean;
  key: string;
  icon: string;
  text: string;
}
export const APP_TABS = () => {
  const repoMenu = layoutStore.useStore((s) => s.subList.repo);
  const [repoKey, commitKey, branchKey, mrKey] = repoMenu?.length
    ? repoMenu.map((a: { tabKey: string }) => a.tabKey)
    : ['repo', 'repo/commits', 'repo/branches', 'repo/mr/open'];
  const appDetail = appStore.useStore((s) => s.detail);

  const { mode, isExternalRepo } = appDetail;
  const perm = usePerm((s) => s.app);
  const appSwitch = {
    key: '_',
    className: 'mr-4',
    name: <HeadAppSelector />,
  };
  const repo = {
    show: perm.repo.read.pass,
    key: repoKey,
    split: true,
    name: i18n.t('dop:code'),
    isActive: (activeKey: string) => {
      return activeKey === 'repo' || activeKey.startsWith('repo/tree');
    },
  };
  // these tab auth is same with repo
  const commit = {
    show: perm.repo.read.pass,
    key: commitKey,
    name: i18n.t('dop:commits'),
    isActive: (activeKey: string) => activeKey.startsWith('repo/commits'),
  };
  const branch = {
    show: perm.repo.read.pass,
    key: branchKey,
    name: i18n.t('dop:branch'),
    isActive: (activeKey: string) => activeKey.startsWith('repo/branches'),
  };
  const mr = {
    show: perm.repo.read.pass,
    key: mrKey,
    name: i18n.t('dop:merge request'),
    isActive: (activeKey: string) => activeKey.startsWith('repo/mr'),
  };

  const pipeline = {
    show: perm.pipeline.read.pass,
    key: 'pipeline',
    name: i18n.t('pipeline'),
  };
  const dataTask = {
    show: perm.dataTask.read.pass,
    key: 'dataTask',
    name: `${i18n.t('dop:data task')}`,
  };
  const dataModel = {
    show: perm.dataModel.read.pass,
    key: 'dataModel',
    name: `${i18n.t('dop:data model')}`,
  };
  const dataMarket = {
    show: perm.dataMarket.read.pass,
    key: 'dataMarket',
    name: `${i18n.t('dop:data market')}`,
  };
  const quality = {
    show: perm.codeQuality.read.pass,
    key: 'quality',
    name: i18n.t('dop:code quality'),
  };

  const apiDesign = {
    show: perm.apiDesign.read.pass,
    key: 'apiDesign',
    name: 'API',
  };

  const setting = {
    show: perm.setting.read.pass,
    key: 'setting',
    name: i18n.t('dop:setting'),
  };

  const repoTabs = isExternalRepo ? [] : [commit, branch, mr];
  const modeMap = {
    [appMode.SERVICE]: [repo, ...repoTabs, pipeline, apiDesign, quality, setting],
    [appMode.PROJECT_SERVICE]: [repo, ...repoTabs, pipeline, quality, setting],
    [appMode.MOBILE]: [repo, ...repoTabs, pipeline, apiDesign, quality, setting],
    [appMode.LIBRARY]: [repo, ...repoTabs, pipeline, apiDesign, quality, setting],
    [appMode.BIGDATA]: [repo, ...repoTabs, dataTask, dataModel, dataMarket, setting],
    [appMode.ABILITY]: [quality, setting],
  };

  const tabs = filter(modeMap[mode], (item: ITab) => item.show !== false) as ROUTE_TABS[];
  const currentRoute = routeInfoStore.useStore((s) => s.currentRoute);
  React.useEffect(() => {
    if (currentRoute.mark === 'application') {
      const firstAvailableTab = tabs.find((t) => t.show && t.href);
      if (firstAvailableTab?.href) {
        goTo(`${firstAvailableTab.key}`, { replace: true });
      }
    }
  }, [currentRoute, tabs]);
  return [appSwitch, ...tabs] as ROUTE_TABS[];
};
