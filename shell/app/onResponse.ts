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

import userMapStore from 'app/common/stores/user-map';
import { notify } from './common/utils';

export default (body: any, params: any, apiConfig: any) => {
  if ('success' in body && 'err' in body) {
    const { data, success, err, userInfo } = body;
    if (userInfo) {
      userMapStore.reducers.setUserMap(userInfo);
    }

    if (params && 'pageNo' in params) {
      // it's a paging api, generate paging obj automatically
      const { total } = data;
      const { pageNo, pageSize = 15 } = params;
      const hasMore = Math.ceil(total / +pageSize) > +pageNo;
      data.paging = { pageNo, pageSize, total, hasMore };
      data.list = data.list || data.data;
    }

    if (success) {
      const successMsg = params?.$options?.successMsg || apiConfig?.successMsg;
      successMsg && notify('success', successMsg);
    } else if (err) {
      const errorMsg = err?.msg || params?.$options?.errorMsg || apiConfig?.errorMsg;
      errorMsg && notify('error', errorMsg);
    }
  }
};
