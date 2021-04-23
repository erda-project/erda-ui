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

import path from 'path';
import { getConfig } from 'core/config';
import { filter, isFunction, mapValues, throttle, pickBy, isEmpty } from 'lodash';
import { qs } from './query-string';
import routeInfoStore from 'common/stores/route';

export function resolvePath(goPath: string) {
  return path.resolve(window.location.pathname, goPath);
}

const changeBrowserHistory = throttle((action, _path) => {
  const history = getConfig('history');
  action === 'replace' ? history.replace(_path) : history.push(_path);
}, 1000, { trailing: false });

interface IOptions {
  [pathName: string]: any;
  append?: boolean;
  replace?: boolean;
  forbidRepeat?: boolean;
  jumpOut?: boolean;
}

/**
 * 路由跳转
 * @param pathStr 跳转路径
 * @param {string} options.replace 替换当前history记录
 * @param {boolean} options.forbidRepeat 为true时1s内禁止再次点击
 * @param {boolean} options.jumpOut 为true时新开窗口
 * @param {object} options.rest 使用pages时的参数对象
 */

export const goTo = (pathStr: string, options?: IOptions) => {
  const { replace = false, forbidRepeat = false, jumpOut = false, query, ...rest } = options as IOptions || {};
  let _path = '';

  if (/^(http|https):\/\//.test(pathStr)) { // 外链
    if (jumpOut) {
      window.open(pathStr);
    } else {
      window.location.href = pathStr;
    }
    return;
  } else if (pathStr.startsWith(goTo.pagePrefix)) {
    const [urlParams, urlQuery] = routeInfoStore.getState(s => [s.params, s.query]);
    const pathParams = { ...urlParams, ...urlQuery, ...rest };
    const curPath = goTo.pagePathMap[pathStr.replace(goTo.pagePrefix, '')];
    // 缺少参数
    if (curPath === undefined) {
      return;
    }
    _path = isFunction(curPath) ? curPath(pathParams) : curPath;
  } else {
    _path = resolvePath(pathStr);
  }
  if (query && !isEmpty(query)) {
    _path += `?${qs.stringify(query)}`;
  }

  if (jumpOut) {
    window.open(_path);
    return;
  }

  const action = replace ? 'replace' : 'push';

  if (forbidRepeat) {
    changeBrowserHistory(action, _path);
  } else {
    const history = getConfig('history');
    action === 'replace' ? history.replace(_path) : history.push(_path);
  }
};

const pathFormat = (url: string) => (params: object) => {
  const necessaryArg: string[] = [];
  const [_path, _query] = url.split('?');
  // query不算必须的路由参数
  const newPath = _path.replace(/\{(\w+)\}/g, (_, key) => {
    necessaryArg.push(key);
    return params[key];
  });
  const lostArg = filter(necessaryArg, (arg: string) => params[arg] === undefined);
  if (lostArg.length) {
    // eslint-disable-next-line no-console
    console.error('Jump missing parameters：', lostArg);
    return undefined;
  }
  if (!_query) {
    return newPath;
  }
  let newQuery = _query.replace(/\{(\w+)\}/g, (_, key) => {
    return (params[key] !== undefined && params[key] !== null) ? params[key] : '';
  });
  // 移除空的query参数
  newQuery = qs.stringify(pickBy(qs.parse(newQuery), (v: any) => v !== ''));
  return [newPath, newQuery].join('?');
};
goTo.pagePrefix = '__dice__'; // 防止goTo传入同名参数

export enum pages {
  noAuth = '/{orgName}/noAuth',
  perm = '/{orgName}/perm?scope={scope}',
  inviteToOrg = '/{orgName}/inviteToOrg',
  freshMan = '/{orgName}/freshMan',
  notFound = '/{orgName}/notFound',

  // workBench
  orgRoot = '/{orgName}',
  orgList = '/{orgName}/org-list',
  workBenchRoot = '/{orgName}/workBench/projects',
  workBenchApps = '/{orgName}/workBench/apps',
  workBenchService = '/{orgName}/workBench/service',
  workBenchApprove = '/{orgName}/workBench/my-approve',
  workBenchApprovePending = '/{orgName}/workBench/approval/my-approve/pending',
  workBenchMyInitiate = '/{orgName}/workBench/approval/my-initiate',
  workBenchMyInitiateWait = '/{orgName}/workBench/approval/my-initiate/WaitApprove',
  workBenchPublisher = '/{orgName}/workBench/publisher',


  // project
  project = '/{orgName}/workBench/projects/{projectId}',
  projectSetting = '/{orgName}/workBench/projects/{projectId}/setting',
  projectNotifyGroup = '/{orgName}/workBench/projects/{projectId}/setting?tabKey=notifyGroup',
  projectService = '/{orgName}/workBench/projects/{projectId}/service',
  testPlanDetail = '/{orgName}/workBench/projects/{projectId}/testPlan/manual/{testPlanID}?caseId={caseId}&testSetID={testSetID}',
  projectApps = '/{orgName}/workBench/projects/{projectId}/apps',
  projectAllIssue = '/{orgName}/workBench/projects/{projectId}/issues/all',
  projectIssueDetail = '/{orgName}/workBench/projects/{projectId}/issues/{type}?id={id}&type={type}',
  projectIssueRoot = '/{orgName}/workBench/projects/{projectId}/issues',
  projectTestCaseRoot = '/{orgName}/workBench/projects/{projectId}/testCase',
  projectManualTestCase = '/{orgName}/workBench/projects/{projectId}/testCase/manual',
  projectDataBankRoot = '/{orgName}/workBench/projects/{projectId}/data-bank',
  projectDataSource = '/{orgName}/workBench/projects/{projectId}/data-bank/data-source',
  projectTestPlaneRoot = '/{orgName}/workBench/projects/{projectId}/testPlan',
  projectManualTestPlane = '/{orgName}/workBench/projects/{projectId}/testPlan/manual',
  projectTestEnvRoot = '/{orgName}/workBench/projects/{projectId}/testEnv',
  projectManualTestEnv = '/{orgName}/workBench/projects/{projectId}/testEnv/manual',
  projectDashboard = '/{orgName}/workBench/projects/{projectId}/dashboard',
  projectResource = '/{orgName}/workBench/projects/{projectId}/resource',
  projectTicket = '/{orgName}/workBench/projects/${projectId}/ticket',

  // app
  app = '/{orgName}/workBench/projects/{projectId}/apps/{appId}',
  repo = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/repo',
  appMr = '/{orgName}/workBench/projects/{projectId}/apps/${appId}/repo/mr/open/${mrId}',
  pipelineRoot = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/pipeline',
  appApiDesign = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/apiDesign',
  repoBackup = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/repo/backup',
  commit = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/repo/commit/{commitId}',
  branches = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/repo/branches',
  tags = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/repo/tags',
  commits = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/repo/commits/{branch}/{path}',
  pipeline = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/pipeline?caseId={caseId}&pipelineID={pipelineID}',
  dataTask = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/dataTask/{pipelineID}',
  dataTaskRoot = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/dataTask',
  deploy = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/deploy',
  qaTicket = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/ticket/open?type={type}',
  release = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/repo/release?q={q}',
  runtimeDetail = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/deploy/runtimes/{runtimeId}/overview?serviceName={serviceName}&jumpFrom={jumpFrom}',
  runtimeDetailRoot = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/deploy/runtimes/{runtimeId}/overview',
  appDataModel = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/dataModel',
  appDataMarket = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/dataMarket',
  appCodeQuality = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/test',
  appCodeQualityReports = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/test/quality',
  appCodeQualityIssueOpen = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/ticket/open',
  appCodeQualityIssue = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/ticket',
  appSetting = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/setting',

  // 中间件平台首页 /addonPlatform/addonsManage 去掉了。详情页保留，暂时挂在DevOps平台下面。
  addonPlatformOverview = '/{orgName}/workBench/addonsManage/{projectId}/{instanceId}/overview',
  logAnalyticConsole = '/{orgName}/workBench/addonsManage/{projectId}/{instanceId}/log-analytics?appName={appName}',
  jvmProfiler = '/{orgName}/workBench/addonsManage/{projectId}/{instanceId}/jvm-profiler',
  appSetting_config = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/setting?tabKey=appConfig',
  buildDetailConfig = '/{orgName}/workBench/projects/{projectId}/config/apps/{appId}/runtimes/{branch}/{env}',
  microServiceRoot = '/{orgName}/microService/microServiceManage',
  microServiceOverviewRoot = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}',
  microServiceOverview = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}?appId={appId}&runtimeId={runtimeId}',
  microServiceApiStrategy = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/gateway/api-package/{packageId}/detail/api-policies/safety-policy',
  microServiceTopology = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/topology/{terminusKey}?appId={appId}',
  monitorAPIOverview = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/gateway/apis/api-monitor?appId={appId}&runtimeId={runtimeId}',
  microTraceSearch = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/monitor/{terminusKey}/trace/search?appId={appId}&timeFrom={timeFrom}&timeTo={timeTo}&status={status}',
  dataCenterRoot = '/{orgName}/dataCenter/overview',

  createProject = '/{orgName}/orgCenter/projects/createProject',
  dataCenterClusters = '/{orgName}/dataCenter/clusters',
  dataCenterClusterState = '/{orgName}/dataCenter/clusters/{clusterName}/state',
  publisherContent = '/{orgName}/workBench/publisher/{type}/{publisherItemId}',
  iterationDetail = '/{orgName}/workBench/projects/{projectId}/issues/iteration/{iterationId}/{issueType}',
  taskList = '/{orgName}/workBench/projects/{projectId}/issues/task',
  bugList = '/{orgName}/workBench/projects/{projectId}/issues/bug',
  issueDetail = '/{orgName}/workBench/projects/{projectId}/issues/{issueType}?id={issueId}&iterationID={iterationId}&type={issueType}',
  ticketDetail = '/{orgName}/workBench/projects/{projectId}/ticket?id={issueId}&pageNo=1',
  backlog = '/{orgName}/workBench/projects/{projectId}/issues/backlog?id={issueId}&issueType={issueType}',
  project_test_autoTestPlanDetail = '/{orgName}/workBench/projects/{projectId}/testPlan/auto/{id}',
  project_test_spaceDetail_apis = '/{orgName}/workBench/projects/{projectId}/testCase/auto/{id}/apis',
  project_test_spaceDetail_scenes = '/{orgName}/workBench/projects/{projectId}/testCase/auto/{id}/scenes',


  // 微服务
  apiStrategy = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/gateway/api-package/{packageId}/detail/api-policies/safety-policy?apiId={apiId}',
  apiManageQuery = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/gateway/apis?redirectApp={redirectApp}&redirectService={redirectService}&redirectRuntimeId={redirectRuntimeId}',
  apiManage = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/gateway/apis',

  // 微服务日志分析规则
  ms_addLogAnalyzeRule = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/log/{addonId}/rule/add?source={source}',

  // 网关“入口流量管理”
  getwayDetail = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/gateway/api-package/{packageId}/detail',
  gatewayList = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/gateway/api-package?domain={domain}',

  // fdp
  fdpIndex = '/{orgName}/fdp/__cluster__/__workspace__/data-source',

  // 企业中心告警数据报表
  alarmReport = '/{orgName}/dataCenter/alarm/report/{clusterName}/{chartUniqId}?category={category}&x_filter_host_ip={ip}&x_timestamp={timestamp}',

  // 企业中心自定义大盘
  orgCustomDashboard = '/{orgName}/dataCenter/customDashboard',
  orgAddCustomDashboard = '/{orgName}/dataCenter/customDashboard/add',
  orgCustomDashboardDetail = '/{orgName}/dataCenter/customDashboard/{customDashboardId}',

  // 微服务监控自定义大盘
  micro_serviceCustomDashboard = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/monitor/{terminusKey}/custom-dashboard',
  micro_serviceAddCustomDashboard = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/monitor/{terminusKey}/custom-dashboard/add',
  micro_serviceCustomDashboardDetail = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/monitor/{terminusKey}/custom-dashboard/{customDashboardId}',

  // 微服务-服务分析页
  microServiceServiceAnalyze = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/monitor/{terminusKey}/service-list/{applicationId}/{serviceId}/{serviceName}',

  // 企业日志分析规则
  addLogAnalyzeRule = '/{orgName}/dataCenter/log/rule/add?source={source}',

  // 企业告警记录详情
  orgAlarmRecordDetail = '/{orgName}/dataCenter/alarm/record/{id}',

  // 微服务告警记录详情
  micro_serviceAlarmRecordDetail = '/{orgName}/microService/{projectId}/{env}/{tenantGroup}/monitor/{terminusKey}/alarm-record/{id}',

  // 云资源管理
  cloudSource = '/{orgName}/dataCenter/cloudSource',
  dataCenterDomain = '/{orgName}/dataCenter/domain',
  dataCenterServices = '/{orgName}/dataCenter/services',
  dataCenterAddon = '/{orgName}/dataCenter/addon',
  dataCenterJobs = '/{orgName}/dataCenter/jobs',
  dataCenterReport = '/{orgName}/dataCenter/report',
  dataCenterAlarm = '/{orgName}/dataCenter/alarm',
  dataCenterAlarmStatistics = '/{orgName}/dataCenter/alarm/statistics',
  dataCenterAlarmRecord = '/{orgName}/dataCenter/alarm/record',
  dataCenterAlarmStrategy = '/{orgName}/dataCenter/alarm/strategy',
  dataCenterAlarmCustom = '/{orgName}/dataCenter/alarm/custom',
  dataCenterLog = '/{orgName}/dataCenter/log',
  dataCenterLogQuery = '/{orgName}/dataCenter/log/query',
  dataCenterLogRule = '/{orgName}/dataCenter/log/rule',
  cloudSourceEcs = '/{orgName}/dataCenter/cloudSource/ecs',
  cloudSourceVpc = '/{orgName}/dataCenter/cloudSource/vpc',
  cloudSourceOss = '/{orgName}/dataCenter/cloudSource/oss',
  cloudSourceRds = '/{orgName}/dataCenter/cloudSource/rds',
  cloudSourceMq = '/{orgName}/dataCenter/cloudSource/mq',
  cloudSourceRedis = '/{orgName}/dataCenter/cloudSource/redis',
  cloudAccounts = '/{orgName}/dataCenter/cloudSource/accounts',

  // orgCenter
  orgCenterRoot = '/{orgName}/orgCenter/projects',
  orgCenterMarket = '/{orgName}/orgCenter/market',
  orgCenterPublisherSetting = '/{orgName}/orgCenter/market/publisher/setting',
  orgCenterCertificate = '/{orgName}/orgCenter/certificate',
  orgCenterApproval = '/{orgName}/orgCenter/approval',
  orgCenterApprovalUndone = '/{orgName}/orgCenter/approval/undone',
  orgCenterAnnouncement = '/{orgName}/orgCenter/announcement',
  orgCenterSafety = '/{orgName}/orgCenter/safety',


  dataCenterNotifyGroup = '/{orgName}/orgCenter/setting/detail?tabKey=notifyGroup',
  dataCenterSetting = '/{orgName}/orgCenter/setting/detail',

  // Api 管理平台
  apiManageRoot = '/{orgName}/workBench/apiManage/api-market/mine',
  apiManageMarket = '/{orgName}/workBench/apiManage/api-market',
  apiDesign = '/{orgName}/workBench/apiManage/api-design',
  apiAccessManage = '/{orgName}/workBench/apiManage/access-manage',
  apiAccessManageDetail = '/{orgName}/workBench/apiManage/access-manage/detail/{accessID}',
  apiMyVisit = '/{orgName}/workBench/apiManage/client',
  apiManageAssetVersions = '/{orgName}/workBench/apiManage/api-market/{scope}/{assetID}',
  apiManageAssetDetail = '/{orgName}/workBench/apiManage/api-market/{scope}/{assetID}/{versionID}',

  // 市场
  market = '/{orgName}/market/download/{publishItemId}',

  // api仓库
  apiDocs = '/{orgName}/workBench/projects/{projectId}/apps/{appId}/repo/tree/{branchName}/.dice/apidocs/{docName}',

  // 边缘计算平台
  edgeApp = '/{orgName}/edge/application',
  edgeAppSiteManage = '/{orgName}/edge/application/{id}',
  edgeAppSiteIpManage = '/{orgName}/edge/application/{id}/{siteName}',
  edgeResource = '/{orgName}/edge/resource',
  edgeSiteMachine = '/{orgName}/edge/resource/{id}',
  edgeSetting = '/{orgName}/edge/setting',
  edgeSettingDetail = '/{orgName}/edge/setting/{id}',

  // sysAdmin
  sysAdminOrgs = '/{orgName}/sysAdmin/orgs'
}

goTo.pages = { ...pages };
goTo.pagePathMap = {};
goTo.resolve = {} as {
  [k in keyof typeof pages]: (params?: Obj, prependOrigin?: boolean) => string
};
mapValues(pages, (v, k) => {
  goTo.pages[k] = `${goTo.pagePrefix}${k}`;
  goTo.pagePathMap[k] = v.match(/\{.+\}/) ? pathFormat(v) : v;
  goTo.resolve[k] = (params?: Obj, prependOrigin?: boolean) => {
    const [urlParams, urlQuery] = routeInfoStore.getState(s => [s.params, s.query]);
    const pathParams = { ...urlParams, ...urlQuery, ...params };
    const prefix = prependOrigin ? window.location.origin : '';
    const pagePath = pathFormat(v)(pathParams);
    return prefix + pagePath;
  };
});

