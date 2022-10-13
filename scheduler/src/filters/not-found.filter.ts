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
import qs from 'query-string';

const { staticDir, envConfig } = getEnv();
const { BACKEND_URL } = envConfig;
const isLocal = process.env.DEV === 'true'; // online addr is openapi:9529, without protocol
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
  ENABLE_GALLERY = true,
  ENABLE_APPLY_ORG = '',
  TERMINUS_KEY = '',
  TERMINUS_TA_ENABLE = false,
  TERMINUS_TA_URL = '',
  TERMINUS_TA_COLLECTOR_URL = '',
  UI_PUBLIC_ADDR = '',
  I18N_ACCESS_ENV = '',
  GA_ID = '',
  LINKS_AK = '',
  LINKS_SK = '',
} = process.env;

let newContent = indexHtmlContent.replace(
  '<!-- $ -->',
  `<script>window.erdaEnv={UC_PUBLIC_URL:"${UC_PUBLIC_URL}",ENABLE_BIGDATA:"${ENABLE_BIGDATA}",ENABLE_EDGE:"${ENABLE_EDGE}",ENABLE_GALLERY:"${ENABLE_GALLERY}",GA_ID:"${GA_ID}",LINKS_AK:"${LINKS_AK}",LINKS_SK:"${LINKS_SK}",UI_PUBLIC_ADDR:"${UI_PUBLIC_ADDR}",ENABLE_APPLY_ORG:"${ENABLE_APPLY_ORG}",I18N_ACCESS_ENV:"${I18N_ACCESS_ENV}"}</script>`,
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

function XHeaders(headers, req) {
  const newHeader = { ...headers };
  var values = {
    for: req.connection.remoteAddress,
    port: req.port || '',
    proto: req.protocol,
  };

  ['for', 'port', 'proto'].forEach((header) => {
    const originValue = req.headers['x-forwarded-' + header];
    newHeader['x-forwarded-' + header] = originValue ? `${originValue},${values[header]}` : values[header];
  });

  newHeader['x-forwarded-host'] = req.headers['x-forwarded-host'] || req.headers['host'] || '';
  return newHeader;
}

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  // same action as nginx try_files
  async catch(_exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const ua = request.headers['user-agent'];
    if (ua.includes('DingTalkBot-LinkService/1.0')) {
      // actual ua: DingTalkBot-LinkService/1.0 (+https://open-doc.dingtalk.com/microapp/faquestions/ftpfeu)
      response.send(indexHtmlContent);
      return;
    }

    const extension = path.extname(request.path);
    if (!extension || request.path.match(/^\/[\w-]+\/dop\/projects\/\d+\/apps\/\d+\/repo/)) {
      const callApi = (api: string, config?: Record<string, any>) => {
        let headers = config?.headers || {};
        if (request.headers.cookie) {
          headers.cookie = request.headers.cookie;
        }
        if (request.headers.referer) {
          headers.referer = request.headers.referer;
        }
        headers = XHeaders(headers, request);
        const token = getCookies(request.headers.cookie, 'OPENAPI-CSRF-TOKEN');
        if (token) {
          headers['OPENAPI-CSRF-TOKEN'] = token;
        }
        // add {orgName} part only in local mode
        const req = axios(isLocal ? api.replace('/api', '/api/-') : api, {
          ...config,
          baseURL: API_URL,
          headers,
          validateStatus: () => true, // pass data and error to later check
        });
        console.log(`request ${api}------headers`, headers, '-----request', request);
        return req;
      };
      const initData: any = {};
      const orgName = request.path.split('/')[1];
      const domain = request.hostname.replace('local.', '');
      try {
        const callList = [
          callApi('/api/users/me', { headers: { domain } }),
          callApi('/api/orgs', { params: { pageNo: 1, pageSize: 100, joined: true }, headers: { org: '-', domain } }), // pass header org={notEmpty} to get joined orgs for system admin user
          callApi('/api/permissions/actions/access', {
            method: 'POST',
            data: { scope: { type: 'sys', id: '0' } },
            headers: { domain },
          }),
        ];
        if (orgName && orgName !== '-') {
          callList.push(
            callApi('/api/orgs/actions/get-by-domain', { params: { orgName, domain }, headers: { domain } }),
          );
        }
        const respList = await Promise.allSettled(callList);
        const [userRes, orgListRes, sysAccessRes, orgRes] = respList.map((res) =>
          res.status === 'fulfilled' ? { ...res.value.data, status: res.value.status } : null,
        );
        console.log('/api/user/me response------', userRes);
        console.log('/api/orgs response------', orgListRes);

        console.log('/api/permissions/actions/access response------', sysAccessRes);
        console.log('/api/orgs/actions/get-by-domain------', orgRes);

        if (userRes?.status === 401) {
          const loginRes = await callApi('/api/openapi/login', {
            headers: { referer: `${request.protocol}://${request.hostname}${request.url}` },
          });
          if (loginRes?.data?.url) {
            const { query } = qs.parseUrl(loginRes.data.url);
            response.cookie('erda_uc_redirecturl', query?.redirectUrl || request.url, { maxAge: 3000 }); // expired after 3s
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
          // support user may not join currentOrg but have access to the currentOrg
          initData.currentOrg = orgRes.data;
          if (initData.currentOrg?.id) {
            const orgAccessRes = await callApi(`/api/permissions/actions/access`, {
              method: 'POST',
              data: { scope: { type: 'org', id: `${initData.currentOrg.id}` } },
              headers: { domain },
            });
            if (orgAccessRes?.data) {
              let { permissionList = [], resourceRoleList = [] } = orgAccessRes.data.data;
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

function getCookies(cookies: string, key: string) {
  if (!cookies) return '';
  const _cookies = {};
  cookies.split(';').forEach((item) => {
    const [k, v] = item.split('=');
    _cookies[k.trim()] = v && v.trim();
  });
  return _cookies[key];
}
