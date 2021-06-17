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

import { apiCreator } from 'common';

interface IDomainRequest {
  domain?: string;
  clusterName?: string;
  type?: string;
  projectID?: string;
  workspace?: string;
}

export type DomainManageService = {
  getClusterList: (params: { orgID: number }) => ORG_CLUSTER.ICluster[];
  getDomainList: (params: IDomainRequest & IPagingReq) => IPagingData<DOMAIN_MANAGE.IDomain>;
};

const apis = {
  getClusterList: '/api/clusters',
  getDomainList: '/api/domains',
};

export default apiCreator<DomainManageService>(apis, 'domain-manage');
