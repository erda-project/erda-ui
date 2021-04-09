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

export const getNotifyGroupList = ({ pageNo, pageSize }) => {
  return agent.get('/api/notify-groups')
    .query({ pageNo, pageSize })
    .then(response => response.body);
};

export const addNotifyGroup = (data) => {
  return agent.post('/api/notify-groups')
    .send(data)
    .then(response => response.body);
};

export const getNotifyGroup = (id) => {
  return agent.get(`/api/notify-groups/${id}`)
    .then(response => response.body);
};

export const updateNotifyGroup = (data) => {
  return agent.put(`/api/notify-groups/${data.id}`)
    .send(data)
    .then(response => response.body);
};

export const deleteNotifyGroup = (data) => {
  return agent.delete(`/api/notify-groups/${data.id}`)
    .then(response => response.body);
};
