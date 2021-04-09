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

export const getNotifyGroups = (query?: COMMON_NOTIFY.IGetNotifyGroupQuery): IPagingResp<COMMON_NOTIFY.INotifyGroup> => {
  return agent.get('/api/notify-groups')
    .query(query)
    .then((response: any) => response.body);
};

export const deleteNotifyGroups = (id: string) => {
  return agent.delete(`/api/notify-groups/${id}`)
    .then((response: any) => response.body);
};

export const createNotifyGroups = (payload: COMMON_NOTIFY.ICreateNotifyGroupQuery) => {
  return agent.post('/api/notify-groups')
    .send(payload)
    .then((response: any) => response.body);
};

export const updateNotifyGroups = ({ id, ...rest }: COMMON_NOTIFY.ICreateNotifyGroupQuery) => {
  return agent.put(`/api/notify-groups/${id}`)
    .send(rest)
    .then((response: any) => response.body);
};
