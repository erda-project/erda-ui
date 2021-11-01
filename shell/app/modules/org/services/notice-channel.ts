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

import agent from 'agent';
import { apiCreator } from 'core/service';

const apis = {
  getNotifyChannelTypes: {
    api: '/api/notify-channel/types',
  },
  getNotifyChannels: {
    api: '/api/notify-channels',
  },
  setNotifyChannelEnable: {
    api: 'put@/api/notify-channel/enabled',
  },
  addNotifyChannel: {
    api: 'post@/api/notify-channel',
  },
  editNotifyChannel: {
    api: 'put@/api/notify-channel',
  },
  deleteNotifyChannel: {
    api: 'delete@/api/notify-channel',
  },
};

export const getNotifyChannelTypes = apiCreator<() => NOTIFY_CHANNEL.ChannelTypeOption[]>(apis.getNotifyChannelTypes);

export const getNotifyChannels = apiCreator<
  (payload: { pageNo: number; pageSize: number }) => NOTIFY_CHANNEL.NotifyChannelData
>(apis.getNotifyChannels);
export const setNotifyChannelEnable = apiCreator<(payload: { id: string; enable: boolean }) => void>(
  apis.setNotifyChannelEnable,
);

export const addNotifyChannel = apiCreator<(payload: NOTIFY_CHANNEL.IAddChannelQuery) => void>(apis.addNotifyChannel);

export const editNotifyChannel = apiCreator<
  (payload: {
    channelProviderType: string;
    config: object;
    name: string;
    type: string;
    enable: boolean;
    id: string;
  }) => void
>(apis.editNotifyChannel);

export const deleteNotifyChannel = apiCreator<(payload: { id: number }) => void>(apis.deleteNotifyChannel);
