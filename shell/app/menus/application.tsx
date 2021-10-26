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
  Config as IconConfig,
} from '@icon-park/react';
import { Icon as CustomIcon } from 'common';
import { appMode } from 'application/common/config';

import React from 'react';

interface IMenuItem {
  show?: boolean;
  key: string;
  href: string;
  icon: string;
  text: string;
}
export const getAppMenu = ({ appDetail }: { appDetail: IApplication }) => {
  const { mode } = appDetail;
  const perm = permStore.getState((s) => s.app);
  const repo = {
    show: perm.repo.read.pass,
    key: 'repo',
    href: goTo.resolve.repo(), // `/dop/projects/${projectId}/apps/${appId}/repo`,
    icon: <IconCode />,
    text: i18n.t('dop:files'),
    subtitle: i18n.t('Code'),
  };
  const pipeline = {
    show: perm.pipeline.read.pass,
    key: 'pipeline',
    href: goTo.resolve.pipelineRoot(), // `/dop/projects/${projectId}/apps/${appId}/pipeline`,
    icon: <IconAssemblyLine />,
    text: i18n.t('dop:pipeline'),
    subtitle: i18n.t('Pipeline'),
  };
  const apiDesign = {
    show: perm.apiDesign.read.pass,
    key: 'apiDesign',
    href: goTo.resolve.appApiDesign(), // `/dop/projects/${projectId}/apps/${appId}/apiDesign`,
    icon: <IconApi />,
    text: i18n.t('project:API design'),
    subtitle: 'API',
  };

  const deploy = {
    show: perm.runtime.read.pass,
    key: 'deploy',
    href: goTo.resolve.deploy(), // `/dop/projects/${projectId}/apps/${appId}/deploy`,
    icon: <CustomIcon type="bushuzhongxin" />,
    text: i18n.t('dop:deployment center'),
    subtitle: i18n.t('Deploy'),
  };
  const dataTask = {
    show: perm.dataTask.read.pass,
    key: 'dataTask',
    href: goTo.resolve.dataTaskRoot(), // `/dop/projects/${projectId}/apps/${appId}/dataTask`,
    icon: <IconActivitySource />,
    text: `${i18n.t('dop:data task')}`,
    subtitle: `${i18n.t('Task')}`,
  };
  const dataModel = {
    show: perm.dataModel.read.pass,
    key: 'dataModel',
    href: goTo.resolve.appDataModel(), // `/dop/projects/${projectId}/apps/${appId}/dataModel`,
    icon: <IconChildrenPyramid />,
    text: `${i18n.t('dop:data model')}`,
    subtitle: `${i18n.t('Model')}`,
  };
  const dataMarket = {
    show: perm.dataMarket.read.pass,
    key: 'dataMarket',
    href: goTo.resolve.appDataMarket(), // `/dop/projects/${projectId}/apps/${appId}/dataMarket`,
    icon: <IconMarketAnalysis />,
    text: `${i18n.t('dop:data market')}`,
    subtitle: `${i18n.t('Market')}`,
  };
  const test = {
    show: perm.codeQuality.read.pass,
    key: 'test',
    href: goTo.resolve.appCodeQuality(), // `/dop/projects/${projectId}/apps/${appId}/test`,
    icon: <CustomIcon type="daimazhiliang" />,
    text: i18n.t('dop:code quality'),
    subtitle: i18n.t('Quality'),
  };
  const release = {
    show: perm.release.read.pass,
    key: 'release',
    href: goTo.resolve.release(), // `/dop/projects/${projectId}/apps/${appId}/repo/release`,
    icon: <CustomIcon type="zhipinguanli" />,
    text: i18n.t('artifact management'),
    subtitle: i18n.t('Artifact'),
  };
  const setting = {
    show: perm.setting.read.pass,
    key: 'setting',
    href: goTo.resolve.appSetting(), // `/dop/projects/${projectId}/apps/${appId}/setting`,
    icon: <IconConfig />,
    text: i18n.t('dop:application setting'),
    subtitle: i18n.t('Setting'),
  };

  // const full = [repo, pipeline, deploy, dataTask, dataModel, dataMarket, test, analysis, release, setting];
  const modeMap = {
    [appMode.SERVICE]: [repo, pipeline, apiDesign, deploy, test, release, setting],
    [appMode.PROJECT_SERVICE]: [repo, pipeline, test, release, setting],
    [appMode.MOBILE]: [repo, pipeline, apiDesign, deploy, test, release, setting],
    [appMode.LIBRARY]: [repo, pipeline, apiDesign, deploy, test, release, setting],
    [appMode.BIGDATA]: [repo, dataTask, dataModel, dataMarket, setting],
    [appMode.ABILITY]: [deploy, test, release, setting],
  };

  return filter(modeMap[mode], (item: IMenuItem) => item.show !== false);
};
