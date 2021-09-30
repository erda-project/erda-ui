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

import { createFlatStore } from 'core/cube';
import { getServiceList } from '../services/service-analytics';

interface IState {
  serviceId: string;
  serviceName: string;
  applicationId: string;
}

const initState: IState = {
  serviceId: '',
  serviceName: '',
  applicationId: '',
};

const serviceAnalytics = createFlatStore({
  name: 'service-analytics',
  state: initState,
  effects: {
    async getServiceList({ call, getParams }, payload: Omit<SERVICE_ANALYTICS.IServiceListQuery, 'terminusKey'>) {
      const { terminusKey } = getParams();
      const { start, end } = payload;
      return await call(getServiceList, { start, end, terminusKey });
    },
  },
  reducers: {
    updateState(state, payload) {
      return { ...state, ...payload };
    },
  },
});

export default serviceAnalytics;
