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
import { goTo } from 'common/utils';
import { Server, MonitorCamera, NotebookAndPen, Api, Config, Log, Components } from '@icon-park/react';

export const envMap = {
  DEV: i18n.t('common:DEV'),
  TEST: i18n.t('common:TEST'),
  STAGING: i18n.t('common:STAGING'),
  PROD: i18n.t('common:PROD'),
};

interface IMSPathParams {
  projectId: string | number
  env: string
  tenantGroup: string
  tenantId: string | number
  terminusKey: string
  logKey: string
}
export const getMSFrontPathByKey = (key: string, params: IMSPathParams) => {
  const { projectId, env, tenantGroup, tenantId, terminusKey, logKey } = params;

  const rootPath = `${goTo.resolve.microServiceOverviewRoot({projectId, env,tenantGroup })}/`;
  const monitorPrefix = `monitor/${terminusKey}`;

  const targetPath = {
    ServiceGovernance: 'topology',
    Overview: `topology/${terminusKey}`,

    AppMonitor: `topology/${terminusKey}`,
    ServiceList: `${monitorPrefix}/service-list`,
    BrowserInsight: `${monitorPrefix}/bi`,
    AppInsight: `${monitorPrefix}/mi`,
    ErrorInsight: `${monitorPrefix}/error`,
    Transaction: `${monitorPrefix}/trace`,
    StatusPage: `${monitorPrefix}/status`,
    Alarm: `${monitorPrefix}/alarm`,
    AlarmRecord: `${monitorPrefix}/alarm-record`,
    CustomAlarm: `${monitorPrefix}/custom-alarm`,
    CustomDashboard: `${monitorPrefix}/custom-dashboard`,
    Reports: `${monitorPrefix}/reports`,

    LogAnalyze: `log/${logKey}/query`,
    LogQuery: `log/${logKey}/query`,
    AnalyzeRule: `log/${logKey}/rule`,

    RegisterCenter: 'registerIntro',
    RegisterIntro: 'registerIntro',
    Nodes: 'nodes',
    Services: 'services',
    CanaryRelease: 'release',

    ApiGateway: 'gateway/gatewayIntro',
    GatewayIntro: 'gateway/gatewayIntro',
    APIs: 'gateway/apis',
    Endpoints: 'gateway/api-package',
    ConsumerACL: 'gateway/consumer',
    Policies: 'gateway/api-policies/safety-policy',
    OldPolicies: 'gateway/old-policies/traffic-policy',
    OldConsumerACL: 'gateway/old-consumer',

    ConfigCenter: 'configIntro',
    ConfigIntro: 'configIntro',
    Configs: `config/${tenantId}`,

    ComponentInfo: `info${tenantId ? `/${tenantId}` : ''}`,
  }[key];

  return rootPath + targetPath;
};

export const MSIconMap = {
  ServiceGovernance: Server,
  AppMonitor: MonitorCamera,
  RegisterCenter: NotebookAndPen,
  APIGateway: Api,
  ConfigCenter: Config,
  ComponentInfo: Components,
  LogAnalyze: Log,
};
