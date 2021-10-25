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
import { ErdaIcon } from 'common';

export const envMap = {
  DEV: i18n.t('common:DEV'),
  TEST: i18n.t('common:TEST'),
  STAGING: i18n.t('common:STAGING'),
  PROD: i18n.t('common:PROD'),
  DEFAULT: i18n.t('common:DEFAULT'),
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
  // service monitor
  const monitorPrefix = `monitor/${terminusKey}`;
  // alarm management
  const alarmManagementPrefix = `alarm-management/${terminusKey}`;
  // query analysis
  const analysisPrefix = `analysis/${terminusKey}`;
  // env synopsis
  const envOverViewPrefix = `synopsis/${terminusKey}`;

  const targetPath = {
    Overview: `${envOverViewPrefix}/topology`,
    AppMonitor: `topology/${terminusKey}`,
    EnvironmentalOverview: envOverViewPrefix,
    ServiceList: `${envOverViewPrefix}/service-list`,
    ServiceObservation: monitorPrefix,
    ServiceAnalysis: `${monitorPrefix}/service-analysis`,
    FrontMonitor: `${monitorPrefix}/bi`,
    AppInsight: `${monitorPrefix}/mi`,
    ErrorInsight: `${monitorPrefix}/error`,
    Tracing: `${monitorPrefix}/trace`,
    ActiveMonitor: `${monitorPrefix}/status`,
    AlarmManagement: alarmManagementPrefix,
    AlertStrategy: `${alarmManagementPrefix}/alarm`,
    AlarmHistory: `${alarmManagementPrefix}/alarm-record`,
    RuleManagement: `${alarmManagementPrefix}/custom-alarm`,
    NotifyGroupManagement: `${alarmManagementPrefix}/notify-group`,
    QueryAnalysis: analysisPrefix,
    Dashboard: `${analysisPrefix}/custom-dashboard`,
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
    EnvironmentSet: 'environment',
    AccessConfig: `environment/${terminusKey}/configuration`,
    MemberManagement: `environment/${terminusKey}/member`,
    ComponentInfo: `environment/info${tenantId ? `/${tenantId}` : ''}`,
  }[key];

  return rootPath + targetPath;
};

export const getMSPSubtitleByName = (name: string) => {
  const MSPSubtitleMap = {
    环境总览: '总览',
    MicroService: 'MS',
    应用监控: '监控',
    AppMonitor: 'Monitor',
    查询分析: '查询',
    QueryAnalysis: 'Query',
    日志分析: '日志',
    LogAnalyze: 'Log',
    API网关: '网关',
    APIGateway: 'Gateway',
    注册中心: '注册',
    RegisterCenter: 'Register',
    配置中心: '配置',
    ConfigCenter: 'Config',
    告警管理: '告警',
    AlarmManagement: 'Alarm',
    环境设置: '设置',
    EnvironmentSet: 'Set',
  };

  return MSPSubtitleMap[name];
};

const renderIcon = (type: string) => () => {
  return <ErdaIcon className="erda-icon" type={type} fill="primary" />;
};

export const MSIconMap = {
  EnvironmentalOverview: renderIcon('huanjinggailan'),
  QueryAnalysis: renderIcon('chaxunfenxi'),
  ServiceObservation: renderIcon('fuwuguancesvg'),
  AlarmManagement: renderIcon('gaojingguanli'),
  EnvironmentSet: IconComponents,
  ServiceGovernance: IconServer,
  AppMonitor: IconMonitorCamera,
  RegisterCenter: IconNotebookAndPen,
  APIGateway: IconApi,
  ConfigCenter: IconConfig,
  ComponentInfo: IconComponents,
  LogAnalyze: IconLog,
};
