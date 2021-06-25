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

export const getSubSlowHttpList = (payload: MONITOR_SI.ITableDataQuery): IChartResult => {
  return agent
    .get('/api/tmc/metrics/application_http_slow')
    .query(payload)
    .then((response: any) => response.body);
};

export const getSubSlowRPCList = (payload: MONITOR_SI.ITableDataQuery): IChartResult => {
  return agent
    .get('/api/tmc/metrics/application_rpc_slow')
    .query(payload)
    .then((response: any) => response.body);
};

export const getSubErrorHttpList = (payload: MONITOR_SI.ITableDataQuery): IChartResult => {
  return agent
    .get('/api/tmc/metrics/application_http_error')
    .query(payload)
    .then((response: any) => response.body);
};

export const getSubSlowDbList = (payload: MONITOR_SI.ITableDataQuery): IChartResult => {
  return agent
    .get('/api/tmc/metrics/application_db_slow')
    .query(payload)
    .then((response: any) => response.body);
};

export const getSubErrorDbList = (payload: MONITOR_SI.ITableDataQuery): IChartResult => {
  return agent
    .get('/api/tmc/metrics/application_db_error')
    .query(payload)
    .then((response: any) => response.body);
};
