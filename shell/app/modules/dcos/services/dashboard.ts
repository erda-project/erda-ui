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

interface IFilterTypeQuery {
  clusterName: string;
  orgName: string;
}
export const getFilterTypes = (payload: IFilterTypeQuery): ORG_DASHBOARD.IFilterType[] => {
  return agent.get('/api/cluster/resources/types')
    .query(payload)
    .then((response: any) => response.body);
};

export const getGroupInfos = ({ orgName, ...rest }: ORG_DASHBOARD.IGroupInfoQuery): ORG_DASHBOARD.IGroupInfo => {
  return agent.post('/api/cluster/resources/group')
    .query({ orgName })
    .send(rest)
    .then((response: any) => response.body);
};

export interface IInstanceListQuery {
  instanceType: string;
  orgName?: string;
  clusters: Array<{ clusterName: string; hostIPs?: string[] }>;
  filters?: ORG_DASHBOARD.IFilterQuery[];
  start?: string;
}
export const getInstanceList = ({ instanceType, orgName, clusters, filters, start }: ORG_DASHBOARD.IInstanceListQuery): ORG_DASHBOARD.IInstance => {
  return agent.post(`/api/cluster/resources/containers/${instanceType}`)
    .query({ orgName, start })
    .send({ clusters, filters })
    .then((response: any) => response.body);
};

export const getNodeLabels = (): ORG_DASHBOARD.INodeLabel[] => {
  return agent.get('/api/node-labels')
    .then((response: any) => response.body);
};

// TODO: add type define
export const getChartData = ({ query, clusters, url }: any) => {
  const commonQuery = { limit: 4 };

  const fetchQuery = {
    ...commonQuery,
    ...query,
  };

  return agent.post(url)
    .query(fetchQuery)
    .send({ clusters })
    .then((response: any) => response.body);
};
