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

import agent from 'agent';

export const fetchLog = ({
  fetchApi,
  ...rest
}: {
  [k: string]: any;
  fetchApi?: string;
}): { lines: COMMON.LogItem[] } => {
  return agent
    .get(fetchApi || '/api/runtime/logs')
    .query(rest)
    .then((response: any) => response.body);
};

export function getMembers(payload: MEMBER.GetListServiceQuery) {
  return agent
    .get('/api/members')
    .query(payload)
    .then((response: any) => response.body);
}

export function getRoleMap(payload: MEMBER.GetRoleTypeQuery): IPagingResp<MEMBER.IRoleType> {
  return agent
    .get('/api/members/actions/list-roles')
    .query(payload)
    .then((response: any) => response.body);
}

export function updateMembers(payload: MEMBER.UpdateMemberBody) {
  return agent
    .post('/api/members')
    .send({ ...payload, options: { rewrite: true } }) // 接口上写死options.rewrite=true，避免新增用户（已有的用户）设置角色无用
    .then((response: any) => response.body);
}

export function removeMember(payload: MEMBER.RemoveMemberBody) {
  return agent
    .post('/api/members/actions/remove')
    .send(payload)
    .then((response: any) => response.body);
}

export const getMemberLabels = (): { list: Array<{ label: string; name: string }> } => {
  return agent.get('/api/members/actions/list-labels').then((response: any) => response.body);
};

export const getUsers = (payload: { q?: string; userID?: string | string[] }) => {
  return agent
    .get('/api/users')
    .query(payload)
    .then((response: any) => response.body);
};

export const getUsersNew = (payload: Merge<IPagingReq, { q?: string }>) => {
  return agent
    .get('/api/users/actions/search')
    .query(payload)
    .then((response: any) => response.body);
};

export const getApps = ({
  pageSize,
  pageNo,
  projectId,
  q,
  searchKey,
  memberID,
  ...rest
}: APPLICATION.GetAppList): IPagingResp<IApplication> => {
  return agent
    .get('/api/applications')
    .query({ pageSize, pageNo, projectId, q: q || searchKey, memberID, ...rest })
    .then((response: any) => response.body);
};

export const uploadFile = (file: any): IUploadFile => {
  return agent
    .post('/api/files')
    .send(file)
    .then((response: any) => response.body);
};

export const genOrgInviteCode = (payload: { orgId: number }): { verifyCode: string } => {
  return agent
    .post('/api/orgs/actions/gen-verify-code')
    .send(payload)
    .then((response: any) => response.body);
};

export const getRenderPageLayout = (payload: CONFIG_PAGE.RenderConfig) => {
  return agent
    .post(`/api/component-protocol/actions/render?scenario=${payload.scenario.scenarioKey}`)
    .send(payload)
    .then((response: any) => response.body);
};
