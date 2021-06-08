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

export const getErrorsList = (query: MONITOR_ERROR.IErrorQuery): MONITOR_ERROR.IErrorResp => {
  return agent.get('/api/spot/tmc/errors')
    .query(query)
    .then((response: any) => response.body);
};


export const getEventIds = ({ id, errorType, terminusKey }: MONITOR_ERROR.IEventIdsQuery): string[] => {
  const apiMap = {
    'request-detail': `/api/spot/trace/${id}/error-events`,
    'error-detail': `/api/spot/errors/${id}/error-events`,
  };
  return agent.get(apiMap[errorType])
    .query({ terminusKey })
    .then((response: any) => response.body);
};

export const getEventDetail = ({ id, terminusKey }: MONITOR_ERROR.IEventDetailQuery): MONITOR_ERROR.IEventDetail => {
  return agent.get(`/api/spot/error-events/${id}`)
    .query({ terminusKey })
    .then((response: any) => response.body);
};
