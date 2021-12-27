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

export const getReleaseDetail = ({ releaseID }: { releaseID?: string }): RELEASE.ReleaseDetail => {
  return agent.get(`/api/releases/${releaseID}`).then((response: any) => response.body);
};

export const getAppList = (payload: RELEASE.AppListQuery): { list: RELEASE.AppDetail[] } => {
  return agent
    .get(`/api/applications`)
    .query(payload)
    .then((response: any) => response.body);
};

export const getReleaseList = (payload: RELEASE.ReleaseListQuery): { list: RELEASE.ReleaseDetail[]; total: number } => {
  return agent
    .get(`/api/releases`)
    .query({ ...payload, pageSize: payload.pageSize || 10 })
    .then((response: any) => response.body);
};

export function addRelease(payload: RELEASE.ReleaseDetail): { success: boolean } {
  return agent
    .post('/api/releases')
    .send(payload)
    .then((response: any) => response.body);
}

export function updateRelease({ releaseID, ...payload }: RELEASE.ReleaseDetail): { success: boolean } {
  return agent
    .put(`/api/releases/${releaseID}`)
    .send(payload)
    .then((response: any) => response.body);
}

export function formalRelease({ releaseID }: { releaseID: string }): { success: boolean } {
  return agent.put(`/api/releases/${releaseID}/actions/formal`).then((response: any) => response.body);
}
