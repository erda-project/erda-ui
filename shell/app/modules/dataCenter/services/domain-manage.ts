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

export const getClusterList = ({
  orgId,
}: {
  orgId: number;
}): ORG_CLUSTER.ICluster[] => {
  return agent.get('/api/clusters')
    .query({ orgID: orgId })
    .then((response: any) => response.body);
};

export const getDomainList = (params: DOMAIN_MANAGE.IDomainRequest): IPagingResp<DOMAIN_MANAGE.IDomain> => {
  return agent.get('/api/domains')
    .query(params)
    .then((response: any) => response.body);
};

