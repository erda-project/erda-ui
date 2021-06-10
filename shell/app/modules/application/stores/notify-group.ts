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
import i18n from 'i18n';
import { getNotifyGroups, deleteNotifyGroups, createNotifyGroups, updateNotifyGroups } from '../services/notify-group';
import { PAGINATION } from 'app/constants';

interface IState {
  notifyGroups: COMMON_NOTIFY.INotifyGroup[];
  notifyGroupsPaging: IPaging;
}

const initState: IState = {
  notifyGroups: [],
  notifyGroupsPaging: {
    pageNo: 1,
    pageSize: PAGINATION.pageSize,
    total: 0,
  },
};

const notifyGroup = createStore({
  name: 'common-notify-group',
  state: initState,
  effects: {
    async getNotifyGroups({ call, update }, payload?: COMMON_NOTIFY.IGetNotifyGroupQuery) {
      const { list } = await call(getNotifyGroups, payload);
      update({ notifyGroups: list });
    },
    async deleteNotifyGroups({ call }, payload: string) {
      await call(deleteNotifyGroups, payload, { successMsg: i18n.t('deleted successfully') });
    },
    async createNotifyGroups({ call }, payload: COMMON_NOTIFY.ICreateNotifyGroupQuery) {
      await call(createNotifyGroups, payload, { successMsg: i18n.t('establish successfully') });
    },
    async updateNotifyGroups({ call }, payload: COMMON_NOTIFY.ICreateNotifyGroupQuery) {
      await call(updateNotifyGroups, payload, { successMsg: i18n.t('update successfully') });
    },
  },
  reducers: {
    clearNotifyGroups(state) {
      state.notifyGroups = [];
    },
  },
});

export default notifyGroup;
