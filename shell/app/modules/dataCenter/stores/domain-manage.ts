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

import { createStore } from 'app/cube';
import orgStore from 'app/org-home/stores/org';
import { PAGINATION } from 'app/constants';
import {
  getDomainList,
  getClusterList,
} from '../services/domain-manage';

interface IState {
  clusterList: ORG_CLUSTER.ICluster[];
  domainList: DOMAIN_MANAGE.IDomain[];
  domainPaging: IPaging;
}

const initState: IState = {
  domainPaging: {
    pageNo: 1,
    pageSize: PAGINATION.pageSize,
    total: 0,
  },
  clusterList: [],
  domainList: [],
};

const domainManage = createStore({
  name: 'domain-manage',
  state: initState,
  effects: {
    async getClusterList({ call, update }) {
      const userOrgId = orgStore.getState(s => s.currentOrg.id);
      const clusterList = await call(getClusterList, { orgId: userOrgId });
      if (clusterList && clusterList.length) {
        update({ clusterList });
      }
      return clusterList || [];
    },
    async getDomainList({ call, update }, payload: DOMAIN_MANAGE.IDomainRequest) {
      const { list: domainList } = await call(getDomainList, payload, { paging: { key: 'domainPaging' } });
      update({ domainList });
    },
  },
  reducers: {

  },
});

export default domainManage;
