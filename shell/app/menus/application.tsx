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

import i18n from 'i18n';
import { filter } from 'lodash';
import { goTo } from 'common/utils';
import permStore from 'user/stores/permission';
import { 
  Api as IconApi, 
  Code as IconCode, 
  AssemblyLine as IconAssemblyLine, 
  ActivitySource as IconActivitySource, 
  ChildrenPyramid as IconChildrenPyramid, 
  MarketAnalysis as IconMarketAnalysis, 
  Config as IconConfig 
} from '@icon-park/react';
import { Icon as CustomIcon } from 'common';

import React from 'react';

const appMode = {
  SERVICE: 'SERVICE',
  MOBILE: 'MOBILE',
  LIBRARY: 'LIBRARY',
  BIGDATA: 'BIGDATA',
  ABILITY: 'ABILITY',
};

interface IMenuItem {
  show?: boolean;
  key: string;
  href: string;
  icon: string;
  text: string;
}
export const getAppMenu = ({ appDetail }: { appDetail: IApplication }) => {
  const { mode } = appDetail;
  const perm = permStore.getState(s => s.app);
  const repo = {
    show: perm.repo.read.pass,
    key: 'repo',
    href: goTo.resolve.repo(), // `/workBench/projects/${projectId}/apps/${appId}/repo`,
    icon: <IconCode />,
    text: i18n.t('application:files'),
  };
  const pipeline = {
    show: perm.pipeline.read.pass,
    key: 'pipeline',
    href: goTo.resolve.pipelineRoot(), // `/workBench/projects/${projectId}/apps/${appId}/pipeline`,
    icon: <IconAssemblyLine />,
    text: i18n.t('application:pipeline'),
  };
  const apiDesign = {
    show: perm.apiDesign.read.pass,
    key: 'apiDesign',
    href: goTo.resolve.appApiDesign(), // `/workBench/projects/${projectId}/apps/${appId}/apiDesign`,
    icon: <IconApi />,
    text: i18n.t('project:API design'),
  };

  const deployAuth =  perm.runtime.read.pass && !appDetail.isDeployingApp;
  const deploy = {
    show: deployAuth,
    key: 'deploy',
    href: goTo.resolve.deploy(), // `/workBench/projects/${projectId}/apps/${appId}/deploy`,
    icon: <CustomIcon type="bushuzhongxin" />,
    text: i18n.t('application:deploy center'),
  };
  const dataTask = {
    show: perm.dataTask.read.pass,
    key: 'dataTask',
    href: goTo.resolve.dataTaskRoot(), // `/workBench/projects/${projectId}/apps/${appId}/dataTask`,
    icon: <IconActivitySource />,
    text: `${i18n.t('application:data task')}`,
  };
  const dataModel = {
    show: perm.dataModel.read.pass,
    key: 'dataModel',
    href: goTo.resolve.appDataModel(), // `/workBench/projects/${projectId}/apps/${appId}/dataModel`,
    icon: <IconChildrenPyramid />,
    text: `${i18n.t('application:data model')}`,
  };
  const dataMarket = {
    show: perm.dataMarket.read.pass,
    key: 'dataMarket',
    href: goTo.resolve.appDataMarket(), // `/workBench/projects/${projectId}/apps/${appId}/dataMarket`,
    icon: <IconMarketAnalysis />,
    text: `${i18n.t('application:data market')}`,
  };
  const test = {
    show: perm.codeQuality.read.pass,
    key: 'test',
    href: goTo.resolve.appCodeQuality(), // `/workBench/projects/${projectId}/apps/${appId}/test`,
    icon: <CustomIcon type="daimazhiliang" />,
    text: i18n.t('application:code quality'),
  };
  const release = {
    show: perm.release.read.pass,
    key: 'release',
    href: goTo.resolve.release(), // `/workBench/projects/${projectId}/apps/${appId}/repo/release`,
    icon: <CustomIcon type="zhipinguanli" />,
    text: i18n.t('releases'),
  };
  const setting = {
    show: perm.setting.read.pass,
    key: 'setting',
    href: goTo.resolve.appSetting(), // `/workBench/projects/${projectId}/apps/${appId}/setting`,
    icon: <IconConfig />,
    text: i18n.t('application:application setting'),
  };

  // const full = [repo, pipeline, deploy, dataTask, dataModel, dataMarket, test, analysis, release, setting];
  const modeMap = {
    [appMode.SERVICE]: [repo, pipeline, apiDesign, deploy, test, release, setting],
    [appMode.MOBILE]: [repo, pipeline, apiDesign, deploy, test, release, setting],
    [appMode.LIBRARY]: [repo, pipeline, apiDesign, deploy, test, release, setting],
    [appMode.BIGDATA]: [repo, dataTask, dataModel, dataMarket, setting],
    [appMode.ABILITY]: [deploy, test, release, setting],
  };

  return filter(modeMap[mode], (item: IMenuItem) => item.show !== false);
};
