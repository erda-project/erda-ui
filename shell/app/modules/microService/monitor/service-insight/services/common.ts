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

export const getServiceMenu = (payload: MONITOR_SI.IMenuQuery): MONITOR_SI.IMenu[] => {
  return agent
    .get('/api/tmc/monitor/menus')
    .query(payload)
    .then((response: any) => response.body);
};

export const getBaseInfo = (payload: MONITOR_SI.IBaseInfoQuery): MONITOR_SI.IBaseInfo => {
  // TODO：此处因接口路径上必须要runtimeId，而实际查询通过query的runtimeName，故先写死0，后续跟接口改再调整
  return agent
    .get('/api/tmc/monitor/runtime/0')
    .query(payload)
    .then((response: any) => response.body);
};

export const getInstanceList = ({ fetchApi, ...rest }: MONITOR_SI.IChartQuery): IChartResult => {
  return agent
    .get(fetchApi)
    .query(rest)
    .then((response: any) => response.body);
};
