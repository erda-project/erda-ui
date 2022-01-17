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

export const WORKSPACE_LIST = ['DEV', 'TEST', 'STAGING', 'PROD'];
export const ROOT_DOMAIN = 'erda.cloud';
export const FULL_ROOT_DOMAIN = 'https://erda.cloud';

// doc domain
export const DOC_DOMAIN = 'docs.erda.cloud';

// sidebar help > help doc home page
export const DOC_HELP_HOME = `https://${DOC_DOMAIN}`;
export const DOC_PREFIX = `${DOC_HELP_HOME}/${process.env.mainVersion}`;

// cmp > cluster overview > when cluster is empty, guid page
export const DOC_CMP_CLUSTER_CREATE = `${DOC_PREFIX}/manual/cmp/guide/cluster/management.html`;

// project > setting > cluster setting > resource manage help doc
export const DOC_PROJECT_RESOURCE_MANAGE = `${DOC_PREFIX}/manual/cmp/guide/cluster/management.html#修改集群配置`;

// user dashboard > no org guide page
export const DOC_ORG_INTRO = `${DOC_PREFIX}/manual/quick-start/newbie.html#加入组织`;
export const DOC_PROJECT_INTRO = `${DOC_PREFIX}/manual/quick-start/newbie.html#加入项目`;

// msp guide doc
export const DOC_MSP_HOME_PAGE = `${DOC_PREFIX}/manual/msp/guides/platform/msp-project.html`;
export const DOC_MSP_API_GATEWAY = `${DOC_PREFIX}/manual/msp/guides/apigw/policy.html`;
export const DOC_MSP_REGISTER = `${DOC_PREFIX}/manual/msp/guides/nc/dubbo.html`;
export const DOC_MSP_CONFIG_CENTER = `${DOC_PREFIX}/manual/dop/guides/deploy/config-center.html`;
export const DOC_MSP_MONITOR = `${DOC_PREFIX}/manual/msp/concepts/apm.html#apm`;
export const DOC_MSP_LOG_ANALYSIS = `${DOC_PREFIX}/manual/msp/guides/log/quickstart.html`;

export const { erdaEnv = {} as Obj<string | boolean> } = window;
// uc page
export const UC_USER_SETTINGS = '/uc/settings';
export const UC_USER_LOGIN = '/uc/login';

// cmp guide doc
export const DOC_CMP_CLUSTER_MANAGE = `${DOC_PREFIX}/manual/cmp/guide/cluster/management.html`;

// aliyun
export const ALIYUN_APPLICATION_SMS =
  'https://account.aliyun.com/login/login.htm?oauth_callback=https%3A%2F%2Fdysms.console.aliyun.com%2Fdysms.htm%23%2Fdomestic%2Ftext%2Ftemplate%2Fadd';

export const ALIYUN_APPLICATION_VMS =
  'https://account.aliyun.com/login/login.htm?oauth_callback=https%3A%2F%2Fdyvms.console.aliyun.com%2Fcall%2Fnotify%2Faddt2v';
