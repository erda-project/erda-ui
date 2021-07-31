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
import {
  Server as IconServer,
  MonitorCamera as IconMonitorCamera,
  NotebookAndPen as IconNotebookAndPen,
  Api as IconApi,
  Config as IconConfig,
  Log as IconLog,
  Components as IconComponents,
} from '@icon-park/react';

export const envMap = {
  DEV: i18n.t('common:DEV'),
  TEST: i18n.t('common:TEST'),
  STAGING: i18n.t('common:STAGING'),
  PROD: i18n.t('common:PROD'),
  DEFAULT: i18n.t('common:PROD'),
};

interface IMSPathParams {
  projectId: string | number;
  env: string;
  tenantGroup: string;
  tenantId: string | number;
  terminusKey: string;
  logKey: string;
}
export const getMSFrontPathByKey = (key: string, params: IMSPathParams) => {
  const { projectId, env, tenantGroup, tenantId, terminusKey, logKey } = params;

  const rootPath = `${goTo.resolve.mspOverviewRoot({ projectId, env, tenantGroup })}/`;
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
  ServiceGovernance: IconServer,
  AppMonitor: IconMonitorCamera,
  RegisterCenter: IconNotebookAndPen,
  APIGateway: IconApi,
  ConfigCenter: IconConfig,
  ComponentInfo: IconComponents,
  LogAnalyze: IconLog,
};
