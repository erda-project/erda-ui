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

import { ExceptionFilter, Catch, NotFoundException, HttpException, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { getEnv, getHttpUrl, logger } from '../util';

const { staticDir, envConfig } = getEnv();
const { BACKEND_URL } = envConfig;
const isLocal = BACKEND_URL.startsWith('https'); // online addr is openapi:9529, without protocol
const API_URL = getHttpUrl(BACKEND_URL);

const indexHtmlPath = path.join(staticDir, 'shell', 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  throw Error('You should build shell first before start scheduler');
}
const indexHtmlContent = fs.readFileSync(indexHtmlPath, { encoding: 'utf8' });

const {
  UC_PUBLIC_URL = '',
  ENABLE_BIGDATA = '',
  ENABLE_EDGE = '',
  ENABLE_APPLY_ORG = '',
  TERMINUS_KEY = '',
  TERMINUS_TA_ENABLE = false,
  TERMINUS_TA_URL = '',
  TERMINUS_TA_COLLECTOR_URL = '',
  UI_PUBLIC_ADDR = '',
} = process.env;

let newContent = indexHtmlContent.replace(
  '<!-- $ -->',
  `<script>window.erdaEnv={UC_PUBLIC_URL:"${UC_PUBLIC_URL}",ENABLE_BIGDATA:"${ENABLE_BIGDATA}",ENABLE_EDGE:"${ENABLE_EDGE}",UI_PUBLIC_ADDR:"${UI_PUBLIC_ADDR}",ENABLE_APPLY_ORG:"${ENABLE_APPLY_ORG}"}</script>`,
);
if (TERMINUS_TA_ENABLE) {
  const taContent = `
<script>
!function(e,n,r,t,a,o,c){e[a]=e[a]||function(){(e[a].q=e[a].q||[]).push(arguments)},e.onerror=function(n,r,t,o,c){e[a]("sendExecError",n,r,t,o,c)},n.addEventListener("error",function(n){e[a]("sendError",n)},!0),o=n.createElement(r),c=n.getElementsByTagName(r)[0],o.async=1,o.src=t,c.parentNode.insertBefore(o,c)}(window,document,"script","${TERMINUS_TA_URL}","$ta");
$ta('start', { udata: { uid: 0 }, ak: "${TERMINUS_KEY}", url: "${TERMINUS_TA_COLLECTOR_URL}", ck: true });
</script>
`;
  newContent = newContent.replace('<!-- $ta -->', taContent);
}
const [before, after] = newContent.split('<!-- $data -->');

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  // same action as nginx try_files
  async catch(_exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const extension = path.extname(request.path);
    if (!extension || request.path.match(/^\/[\w-]+\/dop\/projects\/\d+\/apps\/\d+\/repo/)) {
      const callApi = (api: string, config?: Record<string, any>) => {
        const headers = config?.headers || {};
        if (request.headers.cookie) {
          headers.cookie = request.headers.cookie;
        }
        // add {orgName} part only in local mode
        return axios(isLocal ? api.replace('/api', '/api/-') : api, {
          ...config,
          baseURL: API_URL,
          headers: { ...request.headers, ...headers },
          validateStatus: () => true, // pass data and error to later check
        });
      };
      const initData: any = {};
      const orgName = request.path.split('/')[1];
      const domain = request.hostname.replace('local.', '');
      try {
        const callList = [
          callApi('/api/users/me'),
          callApi('/api/orgs', { params: { pageNo: 1, pageSize: 100 }, headers: { org: 'org' } }), // pass header org={notEmpty} to get joined orgs for system admin user
          callApi('/api/permissions/actions/access', { method: 'POST', data: { scope: { type: 'sys', id: '0' } } }),
        ];
        if (orgName && orgName !== '-') {
          callList.push(callApi('/api/orgs/actions/get-by-domain', { params: { orgName, domain } }));
        }
        const respList = await Promise.allSettled(callList);
        const [userRes, orgListRes, sysAccessRes, orgRes] = respList.map((res) =>
          res.status === 'fulfilled' ? { ...res.value.data, status: res.value.status } : null,
        );
        if (userRes?.status === 401) {
          const loginRes = await callApi('/api/openapi/login', {
            headers: { referer: `${request.protocol}://${request.hostname}` },
          });
          if (loginRes?.data?.url) {
            response.redirect(loginRes.data.url);
            return;
          }
        }
        if (userRes?.data) {
          initData.user = userRes.data;
        } else {
          initData.err = '获取用户信息失败 (get user info failed)';
        }
        if (orgListRes?.data) {
          initData.orgs = orgListRes.data.list;
        } else {
          initData.err = '获取组织列表失败 (get org list failed)';
        }
        if (sysAccessRes?.data) {
          const { access, roles } = sysAccessRes.data;
          initData.user.isSysAdmin = access;
          initData.user.adminRoles = roles;
        }
        if (orgRes?.data) {
          initData.orgId = orgRes.data.id; // current org should be in org list, just send id as fewest data
          if (initData.orgId) {
            const orgAccessRes = await callApi(`/api/permissions/actions/access`, {
              method: 'POST',
              data: { scope: { type: 'org', id: `${initData.orgId}` } },
            });
            if (orgAccessRes?.data) {
              let { permissionList, resourceRoleList } = orgAccessRes.data.data;
              permissionList = permissionList.filter((p) => p.resource.startsWith('UI'));
              resourceRoleList = resourceRoleList.filter((p) => p.resource.startsWith('UI'));
              initData.orgAccess = { ...orgAccessRes.data.data, permissionList, resourceRoleList };
            }
          }
        }
      } catch (e) {
        logger.error(e);
        initData.err = '服务暂时不可用 (service is unavailable)';
      }
      response.setHeader('cache-control', 'no-store');
      response.send(
        [
          before,
          `<script>${
            initData.err
              ? `document.querySelector("#erda-skeleton").innerText="${initData.err}"`
              : `window.initData=${JSON.stringify(initData)}`
          }</script>`,
          after,
        ].join(''),
      );
    } else {
      response.statusCode = 404;
      response.end('Not Found');
    }
  }
}
