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
import permStore from 'user/stores/permission';

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
export const getAppMenu = ({ projectId, appId, mode }: { projectId: string, appId: string, mode: APPLICATION.appMode }) => {
  const perm = permStore.getState(s => s.app);
  const repo = {
    show: perm.repo.read.pass,
    key: 'repo',
    href: `/workBench/projects/${projectId}/apps/${appId}/repo`,
    icon: 'code',
    text: i18n.t('application:repository'),
  };
  const pipeline = {
    show: perm.pipeline.read.pass,
    key: 'pipeline',
    href: `/workBench/projects/${projectId}/apps/${appId}/pipeline`,
    icon: 'assembly-line',
    text: i18n.t('application:pipeline'),
  };
  const apiDesign = {
    show: perm.apiDesign.read.pass,
    key: 'apiDesign',
    href: `/workBench/projects/${projectId}/apps/${appId}/apiDesign`,
    icon: 'api',
    text: i18n.t('project:API design'),
  };
  const deploy = {
    show: perm.runtime.read.pass,
    key: 'deploy',
    href: `/workBench/projects/${projectId}/apps/${appId}/deploy`,
    icon: 'network-tree',
    text: i18n.t('application:deploy center'),
  };
  const dataTask = {
    show: perm.dataTask.read.pass,
    key: 'dataTask',
    href: `/workBench/projects/${projectId}/apps/${appId}/dataTask`,
    icon: 'activity-source',
    text: `${i18n.t('application:data task')}`,
  };
  const dataModel = {
    show: perm.dataModel.read.pass,
    key: 'dataModel',
    href: `/workBench/projects/${projectId}/apps/${appId}/dataModel`,
    icon: 'children-pyramid',
    text: `${i18n.t('application:data model')}`,
  };
  const dataMarket = {
    show: perm.dataMarket.read.pass,
    key: 'dataMarket',
    href: `/workBench/projects/${projectId}/apps/${appId}/dataMarket`,
    icon: 'market-analysis',
    text: `${i18n.t('application:data market')}`,
  };
  const test = {
    show: perm.codeQuality.read.pass,
    key: 'test',
    href: `/workBench/projects/${projectId}/apps/${appId}/test`,
    icon: 'folder-quality',
    text: i18n.t('application:code quality'),
  };
  const release = {
    show: perm.release.read.pass,
    key: 'release',
    href: `/workBench/projects/${projectId}/apps/${appId}/repo/release`,
    icon: 'app-store',
    text: i18n.t('releases'),
  };
  const setting = {
    show: perm.setting.read.pass,
    key: 'setting',
    href: `/workBench/projects/${projectId}/apps/${appId}/setting`,
    icon: 'config',
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
