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

import { createFlatStore } from 'app/cube';
import userStore from 'app/user/stores';
import {
  getGroupInfos,
} from '../services/machine-manage';

interface IState {
  groupInfos: MACHINE_MANAGE.IGroupInfo[],
}
const initState:IState = {
  groupInfos: [],
};

const machineManageStore = createFlatStore({
  name: 'machineManage',
  state: initState,
  effects: {
    async getGroupInfos({ call, update }, payload: Omit<MACHINE_MANAGE.IGroupInfoQuery, 'orgName'>) {
      const { orgName } = userStore.getState(s => s.loginUser);
      const data = await call(getGroupInfos, { orgName, ...payload });
      const { groups: groupInfos } = data || {};

      update({
        groupInfos: groupInfos || [],
      });
      return groupInfos;
    },
  },
  reducers: {
    clearGroupInfos(state) {
      state.groupInfos = [];
    },
  },
});

export default machineManageStore;
