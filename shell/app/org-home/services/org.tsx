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
import { RES_BODY, apiCreator } from 'core/service';

const apis = {
  addOrg: {
    api: 'post@/api/-/orgs',
  },
};

export const addOrg = apiCreator<(p: Merge<Partial<ORG.IOrg>, { admins: string[] }>) => void>(apis.addOrg);

export const getOrgByDomain = (payload: ORG.IOrgReq): ORG.IOrg => {
  return agent
    .get('/api/orgs/actions/get-by-domain')
    .query(payload)
    .then((response: any) => response.body);
};

export const getJoinedOrgs = (payload?: { q?: string }): Promise<RES_BODY<IPagingResp<ORG.IOrg>>> => {
  return agent
    .get('/api/orgs')
    .query({ pageNo: 1, pageSize: 100, ...payload })
    .then((response: any) => response.body);
};

export const getPublicOrgs = () => {
  return agent
    .get('/api/orgs/actions/list-public')
    .query({ pageNo: 1, pageSize: 100 })
    .then((response: any) => response.body);
};

export const updateOrg = (org: Merge<Partial<ORG.IOrg>, { id: number }>) => {
  return agent
    .put(`/api/orgs/${org.id}`)
    .send(org)
    .then((response: any) => response.body);
};
