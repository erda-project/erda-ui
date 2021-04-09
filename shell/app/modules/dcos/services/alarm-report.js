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

export const getAlarmReport = ({ query, chartType }) => {
  return agent.get(`/api/orgCenter/metrics/${chartType}/histogram`)
    .query(query)
    .then(response => response.body);
};

export const getSystemReport = ({ query }) => {
  return agent.get('/api/orgCenter/metrics/machine_load/histogram')
    .query(query)
    .then(response => response.body);
};

export const getCPUAlarmReport = ({ query }) => {
  return agent.get('/api/orgCenter/metrics/machine_cpu/histogram')
    .query(query)
    .then(response => response.body);
};

export const getProcessCmdline = (payload) => {
  return agent.get('/api/orgCenter/metrics/procstat')
    .query(payload)
    .then(response => response.body);
};
