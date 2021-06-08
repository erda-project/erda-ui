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

import { getJoinedApps } from 'user/services/user';
import { createFlatStore } from 'app/cube';
import { getStatistic, searchLogAnalytics } from '../services/log-analytics';

interface IState {
  appList: IApplication[];
  searchResult: LOG_ANALYTICS.SearchResult;
}

const initState: IState = {
  appList: [],
  searchResult: {
    total: 0,
    data: [],
  },
};

const logAnalytics = createFlatStore({
  name: 'log-analytics',
  state: initState,
  effects: {
    async getAppList({ call, update, getParams }, payload: { pageNo: number; pageSize: number; q?: string }) {
      const { projectId } = getParams();
      const { list: appList } = await call(getJoinedApps, { ...payload, projectID: projectId });
      update({ appList });
    },
    async searchLogAnalytics({ call, update }, payload: LOG_ANALYTICS.SearchQuery) { // info.config.TERMINUS_LOG_KEY
      const searchResult = await call(searchLogAnalytics, payload);
      searchResult.data && update({ searchResult });
    },
    async getStatistic({ call }, payload: LOG_ANALYTICS.SearchQuery) {
      return call(getStatistic, payload);
    },
  },
  reducers: {
    clearResult() {
      return initState;
    },
  },
});

export default logAnalytics;
