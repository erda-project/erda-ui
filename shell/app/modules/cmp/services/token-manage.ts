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

import { apiCreator } from 'core/service';

// interface IDomainRequest {
//   domain?: string;
//   clusterName?: string;
//   type?: string;
//   projectID?: string;
//   workspace?: string;
// }

interface returnData {
  success: boolean;
  data: string;
}

interface param {
  clusterName: string;
}

const apis = {
  getToken: {
    api: `get@/api/cluster/credential/access-keys`,
  },

  //   getClusterList: {
  //     api: '/api/clusters',
  //   },
  //   getDomainList: {
  //     api: '/api/domains',
  //   },
};

export const getToken = apiCreator<(payload: param) => returnData>(apis.getToken);
