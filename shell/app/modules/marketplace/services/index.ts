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

const apis = {
  getServiceTypes: {
    api: '/api/opus-types',
  },
  getServiceList: {
    api: '/api/opus',
  },
  getServiceDetail: {
    api: '/api/opus/:id/versions',
  },
};

export const getServiceTypes = apiCreator<() => IPagingResp<MARKET.Type>>(apis.getServiceTypes);

export const getServiceList = apiCreator<(p: MARKET.ServiceReq) => IPagingResp<MARKET.Service>>(apis.getServiceList);

export const getServiceDetail = apiCreator<(p: { id: string }) => MARKET.Detail>(apis.getServiceDetail);
