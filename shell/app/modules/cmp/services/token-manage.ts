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
interface tokenInfo {
  id: string;
  accessKey: string;
}

interface tokenParams {
  clusterName: string;
}
interface createAndResetTokenData {
  data: string;
}

const apis = {
  getToken: {
    api: `get@/api/cluster/credential/access-keys`,
  },
  createToken: {
    api: 'post@/api/cluster/credential/access-keys',
  },
  resetToken: {
    api: 'post@/api/cluster/credential/access-keys/actions/reset',
  },
};

export const getToken = apiCreator<(payload: tokenParams) => tokenInfo>(apis.getToken);
export const createToken = apiCreator<(payload: tokenParams) => createAndResetTokenData>(apis.createToken);
export const resetToken = apiCreator<(payload: tokenParams) => createAndResetTokenData>(apis.resetToken);
