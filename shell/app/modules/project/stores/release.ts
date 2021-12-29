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

import { createStore } from 'core/cube';
import { getAppList } from '../services/release';

interface IState {
  appList: RELEASE.AppDetail[];
}

const initState: IState = {
  appList: [] as RELEASE.AppDetail[],
};

const releaseStore = createStore({
  name: 'releaseStore',
  state: initState,
  effects: {
    async getAppList({ call, update }, payload: { projectId: string; q?: string }) {
      const res = await call(getAppList, payload);
      const { list } = res;
      update({ appList: list.map((item) => ({ ...item, title: item.displayName })) });
    },
  },
});

export default releaseStore;
