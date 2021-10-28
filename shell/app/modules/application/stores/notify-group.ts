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
import i18n from 'i18n';
import {
  getNotifyGroups,
  deleteNotifyGroups,
  createNotifyGroups,
  updateNotifyGroups,
  getNotifyChannels,
  getNotifyChannelTypes,
  setNotifyChannelEnable,
  getNotifyChannel,
  addNotifyChannel,
  editNotifyChannel,
  deleteNotifyChannel,
} from '../services/notify-group';
import { PAGINATION } from 'app/constants';

interface IState {
  notifyGroups: COMMON_NOTIFY.INotifyGroup[];
  notifyGroupsPaging: IPaging;
  notifyChannels: COMMON_NOTIFY.NotifyChannel[];
  notifyChannelsPaging: IPaging;
}

const initState: IState = {
  notifyGroups: [],
  notifyGroupsPaging: {
    pageNo: 1,
    pageSize: PAGINATION.pageSize,
    total: 0,
  },
  notifyChannels: [],
  notifyChannelsPaging: {
    pageNo: 1,
    pageSize: PAGINATION.pageSize,
    total: 0,
  },
};

const convertScope = <T extends { scopeType?: COMMON_NOTIFY.ScopeType }>(payload: T): T => {
  const data = { ...payload };
  if (payload?.scopeType === 'msp') {
    data.scopeType = 'project';
  }
  return data;
};

const notifyGroup = createStore({
  name: 'common-notify-group',
  state: initState,
  effects: {
    async getNotifyGroups({ call, update }, payload?: COMMON_NOTIFY.IGetNotifyGroupQuery) {
      const { list } = await call(
        getNotifyGroups,
        payload ? convertScope<COMMON_NOTIFY.IGetNotifyGroupQuery>(payload) : payload,
      );
      update({ notifyGroups: list });
    },
    async deleteNotifyGroups({ call }, payload: { id: string; scopeType: COMMON_NOTIFY.ScopeType }) {
      await call(deleteNotifyGroups, payload, { successMsg: i18n.t('deleted successfully') });
    },
    async createNotifyGroups({ call }, payload: COMMON_NOTIFY.ICreateNotifyGroupQuery) {
      await call(createNotifyGroups, convertScope<COMMON_NOTIFY.ICreateNotifyGroupQuery>(payload), {
        successMsg: i18n.t('established successfully'),
      });
    },
    async updateNotifyGroups({ call }, payload: COMMON_NOTIFY.ICreateNotifyGroupQuery) {
      await call(updateNotifyGroups, convertScope<COMMON_NOTIFY.ICreateNotifyGroupQuery>(payload), {
        successMsg: i18n.t('updated successfully'),
      });
    },
    async getNotifyChannels({ call, update }, payload: { page: number; pageSize: number }) {
      const list = await call(getNotifyChannels, payload, { paging: { key: 'notifyChannelsPaging' } });
      update({ notifyChannels: list });
    },
    async getNotifyChannelTypes({ call }) {
      const channelTypes = await call(getNotifyChannelTypes);
      return channelTypes;
    },
    async setNotifyChannelEnable({ call }, payload: { id: string; enable: boolean }) {
      await call(setNotifyChannelEnable, payload);
    },
    async getNotifyChannel({ call }, payload: { id: string }) {
      await call(getNotifyChannel, payload);
    },
    async addNotifyChannel(
      { call },
      payload: { channelProviderType: string; config: object; name: string; type: string },
    ) {
      await call(addNotifyChannel, payload);
    },
    async editNotifyChannel(
      { call },
      payload: { channelProviderType: string; config: object; name: string; type: string; enable: number; id: string },
    ) {
      await call(editNotifyChannel, payload);
    },
    async deleteNotifyChannel({ call }, payload: { id: string }) {
      await call(deleteNotifyChannel, payload);
    },
  },
  reducers: {
    clearNotifyGroups(state) {
      state.notifyGroups = [];
    },
  },
});

export default notifyGroup;
