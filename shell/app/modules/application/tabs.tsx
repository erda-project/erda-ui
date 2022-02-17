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
import permStore from 'user/stores/permission';
import layoutStore from 'layout/stores/layout';
import appStore from './stores/application';
import routeInfoStore from 'core/stores/route';
import { appMode } from './common/config';
import { filter } from 'lodash';
import { HeadAppSelector } from './common/app-selector';
import { goTo } from 'app/common/utils';

interface ITab {
  show?: boolean;
  key: string;
  href: string;
  icon: string;
  text: string;
}
export const APP_TABS = () => {
  const repoMenu = layoutStore.useStore((s) => s.subList.repo);
  const [repoKey, commitKey, branchKey, mrKey] = repoMenu?.length
    ? repoMenu.map((a: { tabKey: string }) => a.tabKey)
    : ['repo', 'repo/commits', 'repo/branches', 'repo/mr/open'];
  const appDetail = appStore.useStore((s) => s.detail);

  const { mode } = appDetail;
  const perm = permStore.useStore((s) => s.app);
  const appSwitch = {
    key: '_',
    className: 'mr-4',
    name: <HeadAppSelector />,
  };
  const repo = {
    show: perm.repo.read.pass,
    key: repoKey,
    href: goTo.resolve.repo(),
    split: true,
    name: i18n.t('dop:code'),
    isActive: (activeKey: string) => {
      return activeKey === 'repo' || activeKey.startsWith('repo/tree');
    },
  };
  const commit = {
    show: perm.repo.read.pass,
    key: commitKey,
    // href: goTo.resolve.commits(),
    name: i18n.t('dop:commits'),
    isActive: (activeKey: string) => activeKey.startsWith('repo/commits'),
  };
  const branch = {
    show: perm.repo.read.pass,
    key: branchKey,
    // href: goTo.resolve.repo(),
    name: i18n.t('dop:branch'),
    isActive: (activeKey: string) => activeKey.startsWith('repo/branches'),
  };
  const mr = {
    show: perm.repo.read.pass,
    key: mrKey,
    // href: goTo.resolve.appOpenMr(),
    name: i18n.t('dop:merge request'),
    isActive: (activeKey: string) => activeKey.startsWith('repo/mr'),
  };
  const pipeline = {
    show: perm.pipeline.read.pass,
    key: 'pipeline',
    href: goTo.resolve.pipelineRoot(),
    name: i18n.t('pipeline'),
  };
  const dataTask = {
    show: perm.dataTask.read.pass,
    key: 'dataTask',
    href: goTo.resolve.dataTaskRoot(),
    name: `${i18n.t('dop:data task')}`,
  };
  const dataModel = {
    show: perm.dataModel.read.pass,
    key: 'dataModel',
    href: goTo.resolve.appDataModel(),
    name: `${i18n.t('dop:data model')}`,
  };
  const dataMarket = {
    show: perm.dataMarket.read.pass,
    key: 'dataMarket',
    href: goTo.resolve.appDataMarket(),
    name: `${i18n.t('dop:data market')}`,
  };
  const quality = {
    show: perm.codeQuality.read.pass,
    key: 'quality',
    href: goTo.resolve.appCodeQuality(),
    name: i18n.t('dop:code quality'),
  };

  const apiDesign = {
    show: perm.apiDesign.read.pass,
    key: 'apiDesign',
    href: goTo.resolve.appApiDesign(),
    name: 'API',
  };

  const setting = {
    show: perm.setting.read.pass,
    key: 'setting',
    href: goTo.resolve.appSetting(),
    name: i18n.t('dop:setting'),
  };

  const modeMap = {
    [appMode.SERVICE]: [repo, commit, branch, mr, pipeline, apiDesign, quality, setting],
    [appMode.PROJECT_SERVICE]: [repo, commit, branch, mr, pipeline, quality, setting],
    [appMode.MOBILE]: [repo, commit, branch, mr, pipeline, apiDesign, quality, setting],
    [appMode.LIBRARY]: [repo, commit, branch, mr, pipeline, apiDesign, quality, setting],
    [appMode.BIGDATA]: [repo, commit, branch, mr, dataTask, dataModel, dataMarket, setting],
    [appMode.ABILITY]: [quality, setting],
  };

  const tabs = filter(modeMap[mode], (item: ITab) => item.show !== false) as ROUTE_TABS[];
  // console.log('tabs:', tabs);
  const currentRoute = routeInfoStore.useStore((s) => s.currentRoute);
  React.useEffect(() => {
    if (currentRoute.mark === 'application') {
      const firstAvailableTab = tabs.find((t) => t.show && t.href);
      if (firstAvailableTab?.href) {
        goTo(firstAvailableTab.href, { replace: true });
      }
    }
  }, [currentRoute, tabs]);
  return [appSwitch, ...tabs] as ROUTE_TABS[];
};

// export const getQualityTabs = (params: Obj<string>) => {
//   return [
//     { value: 'quality', label: i18n.t('dop:code quality'), onClick: () => goTo(goTo.resolve.appCodeQualityReports(params)) },
//     { value: 'ticket', label: i18n.t('dop:ticket'), onClick: () => goTo(goTo.resolve.appCodeQualityIssueOpen(params)) },
//     { value: 'test', label: i18n.t('dop:report'), onClick: () => goTo(goTo.resolve.appCodeQuality(params)) },
//   ]
// }

// export const prependTabs = (tabs: typeof getQualityTabs, activeTabKey: string) => (Comp: React.ElementType) => (props: any) => {
//   const _tabs = tabs(props.match.params);

//   return (
//     <>
//       <RadioTabs
//         options={_tabs}
//         value={activeTabKey}
//         onChange={(v?: string | number, tab) => {
//           tab?.onClick();
//         }}
//         className="mb-2"
//       />
//       <Comp {...props} _tabKey={activeTabKey} />
//     </>
//   )
// }
