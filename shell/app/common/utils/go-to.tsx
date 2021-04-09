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
import { filter, isFunction, mapValues, throttle, pickBy } from 'lodash';
import { qs } from './query-string';

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
    const curPath = goTo.pagePathMap[pathStr.replace(goTo.pagePrefix, '')];
    // 缺少参数
    if (curPath === undefined) {
      return;
    }
    _path = isFunction(curPath) ? curPath(rest) : curPath;
  } else {
    _path = resolvePath(pathStr);
  }
  if (query) {
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
  noAuth = '/noAuth',
  project = '/workBench/projects/{projectId}',
  projectSetting = '/workBench/projects/{projectId}/setting',
  app = '/workBench/projects/{projectId}/apps/{appId}',
  repo = '/workBench/projects/{projectId}/apps/{appId}/repo',
  repoBackup = '/workBench/projects/{projectId}/apps/{appId}/repo/backup',
  commit = '/workBench/projects/{projectId}/apps/{appId}/repo/commit/{commitId}',
  branches = '/workBench/projects/{projectId}/apps/{appId}/repo/branches',
  tags = '/workBench/projects/{projectId}/apps/{appId}/repo/tags',
  commits = '/workBench/projects/{projectId}/apps/{appId}/repo/commits/{branch}/{path}',
  pipelineRoot = '/workBench/projects/{projectId}/apps/{appId}/pipeline',
  pipeline = '/workBench/projects/{projectId}/apps/{appId}/pipeline?caseId={caseId}&pipelineID={pipelineID}',
  dataTask = '/workBench/projects/{projectId}/apps/{appId}/dataTask/{pipelineID}',
  deploy = '/workBench/projects/{projectId}/apps/{appId}/deploy',
  qaTicket = '/workBench/projects/{projectId}/apps/{appId}/ticket/open?type={type}',
  release = '/workBench/projects/{projectId}/apps/{appId}/repo/release?q={q}',
  runtimeDetail = '/workBench/projects/{projectId}/apps/{appId}/deploy/runtimes/{runtimeId}/overview?serviceName={serviceName}&jumpFrom={jumpFrom}',
  projectNotifyGroup = '/workBench/projects/{projectId}/setting?tabKey=notifyGroup',
  projectService = '/workBench/projects/{projectId}/service',
  testPlanDetail = '/workBench/projects/{projectId}/testPlan/manual/{testPlanID}?caseId={caseId}&testSetID={testSetID}',

  // 中间件平台首页 /addonPlatform/addonsManage 去掉了。详情页保留，暂时挂在DevOps平台下面。
  addonPlatformOverview = '/workBench/addonsManage/{projectId}/{instanceId}/overview',
  logAnalyticConsole = '/workBench/addonsManage/{projectId}/{instanceId}/log-analytics?appName={appName}',
  jvmProfiler = '/workBench/addonsManage/{projectId}/{instanceId}/jvm-profiler',
  appSetting_config = '/workBench/projects/{projectId}/apps/{appId}/setting?tabKey=appConfig',
  buildDetailConfig = '/workBench/projects/{projectId}/config/apps/{appId}/runtimes/{branch}/{env}',
  microServiceRoot = '/microService/microServiceManage',
  microServiceOverview = '/microService/{projectId}/{env}/{tenantGroup}?appId={appId}&runtimeId={runtimeId}',
  microServiceApiStrategy = '/microService/{projectId}/{env}/{tenantGroup}/gateway/api-package/{packageId}/detail/api-policies/safety-policy',
  microServiceTopology = '/microService/{projectId}/{env}/{tenantGroup}/topology/{terminusKey}?appId={appId}',
  monitorAPIOverview = '/microService/{projectId}/{env}/{tenantGroup}/gateway/apis/api-monitor?appId={appId}&runtimeId={runtimeId}',
  microTraceSearch = '/microService/{projectId}/{env}/{tenantGroup}/monitor/{terminusKey}/trace/search?appId={appId}&timeFrom={timeFrom}&timeTo={timeTo}&status={status}',
  dataCenterRoot = '/dataCenter/overview',
  dataCenterClusterState = '/dataCenter/clusters/{clusterName}/state',
  orgCenterRoot = '/orgCenter/projects',
  publisherContent = '/workBench/publisher/{type}/{publisherItemId}',
  dataCenterNotifyGroup = '/orgCenter/setting/detail?tabKey=notifyGroup',
  dataCenterSetting = 'orgCenter/setting/detail',
  workBenchRoot = '/workBench/projects',
  orgHome = '/orgHome',
  iterationDetail = '/workBench/projects/{projectId}/issues/iteration/{iterationId}/{issueType}',
  taskList = '/workBench/projects/{projectId}/issues/task',
  bugList = '/workBench/projects/{projectId}/issues/bug',
  issueDetail = '/workBench/projects/{projectId}/issues/{issueType}?id={issueId}&iterationID={iterationId}&type={issueType}',
  ticketDetail = '/workBench/projects/{projectId}/ticket?id={issueId}&pageNo=1',
  backlog = '/workBench/projects/{projectId}/issues/backlog?id={issueId}&issueType={issueType}',
  project_test_autoTestPlanDetail = '/workBench/projects/{projectId}/testPlan/auto/{id}',
  project_test_spaceDetail_apis = '/workBench/projects/{projectId}/testCase/auto/{id}/apis',
  project_test_spaceDetail_scenes = '/workBench/projects/{projectId}/testCase/auto/{id}/scenes',


  // 微服务
  apiStrategy = '/microService/{projectId}/{env}/{tenantGroup}/gateway/api-package/{packageId}/detail/api-policies/safety-policy?apiId={apiId}',
  apiManageQuery = '/microService/{projectId}/{env}/{tenantGroup}/gateway/apis?redirectApp={redirectApp}&redirectService={redirectService}&redirectRuntimeId={redirectRuntimeId}',
  apiManage = '/microService/{projectId}/{env}/{tenantGroup}/gateway/apis',

  // 微服务日志分析规则
  ms_addLogAnalyzeRule = '/microService/{projectId}/{env}/{tenantGroup}/log/{addonId}/rule/add?source={source}',

  // 网关“入口流量管理”
  getwayDetail = '/microService/{projectId}/{env}/{tenantGroup}/gateway/api-package/{packageId}/detail',
  gatewayList = '/microService/{projectId}/{env}/{tenantGroup}/gateway/api-package?domain={domain}',

  // fdp
  fdpIndex = '/fdp/__cluster__/__workspace__/data-source',

  // 企业中心告警数据报表
  alarmReport = '/dataCenter/alarm/report/{clusterName}/{chartUniqId}?category={category}&x_filter_host_ip={ip}&x_timestamp={timestamp}',

  // 企业中心自定义大盘
  orgCustomDashboard = '/dataCenter/customDashboard',
  orgAddCustomDashboard = '/dataCenter/customDashboard/add',
  orgCustomDashboardDetail = '/dataCenter/customDashboard/{customDashboardId}',

  // 微服务监控自定义大盘
  micro_serviceCustomDashboard = '/microService/{projectId}/{env}/{tenantGroup}/monitor/{terminusKey}/custom-dashboard',
  micro_serviceAddCustomDashboard = '/microService/{projectId}/{env}/{tenantGroup}/monitor/{terminusKey}/custom-dashboard/add',
  micro_serviceCustomDashboardDetail = '/microService/{projectId}/{env}/{tenantGroup}/monitor/{terminusKey}/custom-dashboard/{customDashboardId}',

  // 微服务-服务分析页
  microServiceServiceAnalyze = '/microService/{projectId}/{env}/{tenantGroup}/monitor/{terminusKey}/service-list/{applicationId}/{serviceName}',

  // 企业日志分析规则
  addLogAnalyzeRule = '/dataCenter/log/rule/add?source={source}',

  // 企业告警记录详情
  orgAlarmRecordDetail = '/dataCenter/alarm/record/{id}',

  // 微服务告警记录详情
  micro_serviceAlarmRecordDetail = '/microService/{projectId}/{env}/{tenantGroup}/monitor/{terminusKey}/alarm-record/{id}',

  // 云资源管理
  cloudSource = '/dataCenter/cloudSource',
  cloudSourceEcs = '/dataCenter/cloudSource/ecs',
  cloudSourceVpc = '/dataCenter/cloudSource/vpc',
  cloudSourceOss = '/dataCenter/cloudSource/oss',
  cloudSourceRds = '/dataCenter/cloudSource/rds',
  cloudSourceMq = '/dataCenter/cloudSource/mq',
  cloudSourceRedis = '/dataCenter/cloudSource/redis',
  cloudAccounts = '/dataCenter/cloudSource/accounts',

  // Api 管理平台
  apiManageRoot = '/workBench/apiManage/api-market/mine',
  apiDesign = '/workBench/apiManage/api-design',
  apiAccessManage = '/workBench/apiManage/access-manage',
  apiAccessManageDetail = '/workBench/apiManage/access-manage/detail/{accessID}',
  apiMyVisit = '/workBench/apiManage/client',
  apiManageAssetVersions = '/workBench/apiManage/api-market/{scope}/{assetID}',
  apiManageAssetDetail = '/workBench/apiManage/api-market/{scope}/{assetID}/{versionID}',

  // 市场
  market = '/market/download/{publishItemId}',

  // api仓库
  apiDocs = '/workBench/projects/{projectId}/apps/{appId}/repo/tree/{branchName}/.dice/apidocs/{docName}',

  // 边缘计算平台
  edgeApp = '/edge/application',
  edgeAppSiteManage = '/edge/application/{id}',
  edgeAppSiteIpManage = '/edge/application/{id}/{siteName}',
  edgeResource = '/edge/resource',
  edgeSiteMachine = '/edge/resource/{id}',
  edgeSetting = '/edge/setting',
  edgeSettingDetail = '/edge/setting/{id}',
}

goTo.pages = { ...pages };
goTo.pagePathMap = {};
goTo.resolve = {} as {
  [k in keyof typeof pages]: (params: Obj, prependOrigin?: boolean) => string
};
mapValues(pages, (v, k) => {
  goTo.pages[k] = `${goTo.pagePrefix}${k}`;
  goTo.pagePathMap[k] = v.match(/\{.+\}/) ? pathFormat(v) : v;
  goTo.resolve[k] = (params: Obj, prependOrigin?: boolean) => {
    const prefix = prependOrigin ? window.location.origin : '';
    const pagePath = pathFormat(v)(params);
    return prefix + pagePath;
  };
});

