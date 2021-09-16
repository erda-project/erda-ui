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
export const DOC_CMP_CLUSTER_CREATE = `${DOC_PREFIX}/manual/o_m/create-cluster.html`;

// project > setting > cluster setting > resource manage help doc
export const DOC_PROJECT_RESOURCE_MANAGE = `${DOC_PREFIX}/manual/deploy/resource-management.html#管理配额`;

// user dashboard > no org guide page
export const DOC_ORG_INTRO = `${DOC_PREFIX}/manual/platform-design.html#租户-组织`;
export const DOC_PROJECT_INTRO = `${DOC_PREFIX}/manual/platform-design.html#项目和应用`;

// msp guide doc
export const DOC_MSP_API_GATEWAY = `${DOC_PREFIX}/manual/microservice/api-gateway.html`;
export const DOC_MSP_REGISTER = `${DOC_PREFIX}/manual/microservice/dubbo.html`;
export const DOC_MSP_CONFIG_CENTER = `${DOC_PREFIX}/manual/deploy/config-center.html`;
export const DOC_MSP_MONITOR = `${DOC_PREFIX}/manual/microservice/use-apm-monitor-app.html`;

export const { erdaEnv } = window;
// uc page
export const UC_USER_SETTINGS = '/uc/settings';

// cmp guide doc
export const DOC_CMP_CLUSTER_MANAGE = `${DOC_PREFIX}/manual/cmp/guide/cluster/management.html`;
